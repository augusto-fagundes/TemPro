import type { Prisma } from '@prisma/client';

import { normalizeCities } from './cities';
import { prisma } from './db';
import { DEFAULT_CITY, PRICE_TYPES, SERVICE_MODES } from './data/taxonomy';
import { HttpError } from './errors';
import {
  hashPassword,
  signToken,
  toPublicUser,
  verifyPassword,
  type PublicUser,
} from './auth';
import { formatPrice, listingPriceFromServices, type PriceType } from './pricing';

type ServiceMode = (typeof SERVICE_MODES)[number];

interface RegisterServiceInput {
  name: string;
  category?: string;
  description?: string;
  mode?: ServiceMode;
  priceType?: PriceType;
  priceAmount?: string;
}

export interface AuthSession {
  token: string;
  user: PublicUser;
}

function slugify(name: string): string {
  const base =
    name
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'prestador';
  return base;
}

async function uniqueProviderId(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 2;
  while (await prisma.provider.findUnique({ where: { id: candidate } })) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

async function ensureCategory(tx: Prisma.TransactionClient, name: string) {
  const trimmed = name.trim();
  const existing = await tx.category.findUnique({ where: { name: trimmed } });
  if (existing) return existing;

  const last = await tx.category.findFirst({
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });
  return tx.category.create({
    data: {
      name: trimmed,
      plural: trimmed,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });
}

export async function registerUser(input: {
  name: string;
  firstName: string;
  lastName: string;
  /** Digits only — `registerSchema` has already stripped the formatting. */
  mobile: string;
  email: string;
  password: string;
  city?: string;
  cities?: string[];
  category?: string;
  service: RegisterServiceInput;
}): Promise<AuthSession> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, 'Este e-mail já está cadastrado');

  const serviceName = input.service.name.trim();
  if (!serviceName) {
    throw new HttpError(400, 'Dê um nome ao serviço para publicá-lo');
  }

  const last = await prisma.provider.findFirst({
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  const providerId = await uniqueProviderId(input.name);
  const passwordHash = await hashPassword(input.password);
  const cities = normalizeCities(input.cities ?? (input.city ? [input.city] : []));
  const city = cities[0] || DEFAULT_CITY;
  const category = input.category?.trim() || 'Eletricista';
  if (category === 'Outro') {
    throw new HttpError(400, 'Informe a categoria do seu negócio');
  }

  const serviceCategory =
    input.service.category?.trim() || category;
  if (serviceCategory === 'Outro') {
    throw new HttpError(400, 'Informe a categoria do serviço');
  }

  const priceType = (input.service.priceType ?? 'Sob consulta') as PriceType;
  if (!(PRICE_TYPES as readonly string[]).includes(priceType)) {
    throw new HttpError(400, 'Tipo de preço inválido');
  }
  const mode = input.service.mode ?? 'Em domicílio';
  if (!(SERVICE_MODES as readonly string[]).includes(mode)) {
    throw new HttpError(400, 'Forma de atendimento inválida');
  }
  const amount =
    priceType === 'Sob consulta' ? '' : (input.service.priceAmount ?? '').trim();
  const displayPrice = formatPrice(priceType, amount);

  const user = await prisma.$transaction(async (tx) => {
    await tx.provider.create({
      data: {
        id: providerId,
        name: input.name.trim(),
        category,
        description: '',
        city,
        serviceCities: cities.length > 0 ? cities : [city],
        mode: 'Atende em domicílio',
        listingPrice: listingPriceFromServices([displayPrice]),
        about: '',
        /* The listing is only worth publishing if someone can be reached on
           it, so the celular given at sign-up seeds the WhatsApp button. From
           here on the profile screen owns it — editing it there does not
           write back to `users.mobile`, which stays the account's contact. */
        whatsapp: input.mobile,
        sortOrder: (last?.sortOrder ?? 0) + 1,
      },
    });
    const createdUser = await tx.user.create({
      data: {
        email,
        passwordHash,
        name: input.name.trim(),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        mobile: input.mobile,
        providerId,
      },
    });

    const categoryRow = await ensureCategory(tx, serviceCategory);
    await tx.service.create({
      data: {
        providerId,
        categoryId: categoryRow.id,
        name: serviceName,
        description: (input.service.description ?? '').trim(),
        mode,
        priceType,
        priceAmount: amount,
        displayPrice,
        sortOrder: 0,
      },
    });

    return createdUser;
  });

  const publicUser = toPublicUser(user);
  return { token: signToken(publicUser), user: publicUser };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthSession> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, 'E-mail ou senha inválidos');
  }
  const publicUser = toPublicUser(user);
  return { token: signToken(publicUser), user: publicUser };
}

export async function getUserById(id: number): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new HttpError(401, 'Sessão inválida');
  return toPublicUser(user);
}

import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { CATEGORY_ROWS } from '../src/data/taxonomy';
import {
  photosForProvider,
  SEED_PROVIDERS,
} from '../src/data/seed-providers';
import { parsePrice } from '../src/pricing';

const prisma = new PrismaClient();

const JOAO_PRODUCTS = [
  {
    name: 'Disjuntor 20A',
    description: 'Disjuntor bipolar para quadro residencial.',
    category: 'Eletricista',
    price: 'R$ 45',
  },
  {
    name: 'Fio 2,5 mm (metro)',
    description: 'Cabo flexível para circuitos de tomadas.',
    category: 'Eletricista',
    price: 'A partir de R$ 4',
  },
];

async function main() {
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.providerPhoto.deleteMany();
  await prisma.user.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.category.deleteMany();

  const categoryIds = new Map<string, number>();
  for (const [index, row] of CATEGORY_ROWS.entries()) {
    const created = await prisma.category.create({
      data: {
        name: row.name,
        plural: row.plural,
        sortOrder: index,
      },
    });
    categoryIds.set(row.name, created.id);
  }

  for (const [index, seed] of SEED_PROVIDERS.entries()) {
    const imagery = photosForProvider(seed, index);
    const categoryId = categoryIds.get(seed.category);
    if (!categoryId) {
      throw new Error(`Categoria ausente no seed: ${seed.category}`);
    }

    await prisma.provider.create({
      data: {
        id: seed.id,
        name: seed.name,
        category: seed.category,
        description: seed.desc,
        city: seed.city,
        serviceCities: [seed.city],
        mode: seed.mode,
        listingPrice: seed.price,
        about: seed.about,
        address: seed.address ?? null,
        photoUrl: imagery.photoUrl ?? null,
        sortOrder: index,
        services: {
          create: seed.services.map((service, serviceIndex) => {
            const parsed = parsePrice(service.price);
            return {
              name: service.name,
              categoryId,
              description: service.desc,
              mode: service.mode,
              priceType: parsed.priceType,
              priceAmount: parsed.priceAmount,
              displayPrice: parsed.displayPrice,
              sortOrder: serviceIndex,
            };
          }),
        },
        photos: imagery.photos
          ? {
              create: imagery.photos.map((url, photoIndex) => ({
                url,
                sortOrder: photoIndex,
              })),
            }
          : undefined,
      },
    });
  }

  await prisma.user.create({
    data: {
      email: 'joao@tempro.local',
      passwordHash: await bcrypt.hash('joao1234', 10),
      name: 'João Elétrica',
      providerId: 'joao',
    },
  });

  for (const [index, product] of JOAO_PRODUCTS.entries()) {
    const parsed = parsePrice(product.price);
    await prisma.product.create({
      data: {
        providerId: 'joao',
        name: product.name,
        category: product.category,
        description: product.description,
        priceType: parsed.priceType,
        priceAmount: parsed.priceAmount,
        displayPrice: parsed.displayPrice,
        sortOrder: index,
      },
    });
  }

  console.log(
    `Seed TemPro: ${SEED_PROVIDERS.length} prestadores, ${CATEGORY_ROWS.length} categorias, usuário joao@tempro.local / joao1234.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import type { OwnedService, Provider } from '../types';
import { ALL_CITIES } from '../types';

/**
 * Seed histórico do MVP. O catálogo vivo vem da API TemPro
 * (`GET /api/bootstrap`); este arquivo permanece só como referência do
 * conteúdo original.
 */
const RAW_PROVIDERS: Provider[] = [
  {
    id: 'joao',
    name: 'João Elétrica',
    category: 'Eletricista',
    desc: 'Instalações, manutenção elétrica e reparos residenciais.',
    city: 'Santa Cruz do Sul - RS',
    mode: 'Atende em domicílio',
    price: 'A partir de R$ 120',
    about:
      'Serviços elétricos residenciais e comerciais. Instalações, manutenção, troca de tomadas, chuveiros e quadros elétricos.',
    services: [
      {
        name: 'Instalação elétrica',
        desc: 'Instalações e manutenção elétrica residencial.',
        mode: 'Em domicílio',
        price: 'A partir de R$ 150',
      },
      {
        name: 'Troca de chuveiro',
        desc: 'Substituição de chuveiro e disjuntor, com teste de carga.',
        mode: 'Em domicílio',
        price: 'R$ 80',
      },
    ],
  },
  {
    id: 'hidro',
    name: 'Hidro Sul Encanamentos',
    category: 'Encanador',
    desc: 'Desentupimento, vazamentos e troca de tubulação.',
    city: 'Santa Cruz do Sul - RS',
    mode: 'Ambos',
    price: 'A partir de R$ 90',
    address: 'Rua Marechal Floriano, 480 - Centro',
    about:
      'Atendimento em obras e emergências hidráulicas, com oficina no centro da cidade.',
    services: [
      {
        name: 'Desentupimento',
        desc: 'Pias, ralos e esgoto residencial.',
        mode: 'Em domicílio',
        price: 'A partir de R$ 90',
      },
      {
        name: 'Conserto de vazamento',
        desc: 'Localização e reparo de vazamentos.',
        mode: 'Ambos',
        price: 'Sob consulta',
      },
    ],
  },
  {
    id: 'madeira',
    name: 'Madeira & Forma Marcenaria',
    category: 'Marceneiro',
    desc: 'Móveis planejados, portas e restauro de madeira.',
    city: 'Santa Cruz do Sul - RS',
    mode: 'Possui estabelecimento',
    price: '',
    address: 'Rua Venâncio Aires, 1140 - Higienópolis',
    about:
      'Marcenaria com oficina própria: projeto, corte e montagem de móveis sob medida, portas e esquadrias de madeira.',
    services: [
      {
        name: 'Móvel planejado',
        desc: 'Projeto 3D, execução e montagem.',
        mode: 'Em estabelecimento',
        price: 'Sob consulta',
      },
      {
        name: 'Restauro de móvel',
        desc: 'Lixamento, reparo estrutural e acabamento.',
        mode: 'Em estabelecimento',
        price: 'A partir de R$ 350',
      },
    ],
  },
  {
    id: 'voltec',
    name: 'VoltTec Instalações',
    category: 'Eletricista',
    desc: 'Quadros de energia, automação e cabeamento.',
    city: 'Santa Cruz do Sul - RS',
    mode: 'Ambos',
    price: 'A partir de R$ 140',
    address: 'Av. Independência, 2075',
    about:
      'Instalações elétricas prediais e comerciais, quadros de distribuição, automação residencial e cabeamento de rede.',
    services: [
      {
        name: 'Montagem de quadro elétrico',
        desc: 'Dimensionamento, montagem e identificação de circuitos.',
        mode: 'Ambos',
        price: 'A partir de R$ 480',
      },
      {
        name: 'Cabeamento de rede',
        desc: 'Pontos de rede, certificação e organização de rack.',
        mode: 'Em domicílio',
        price: 'R$ 140 por ponto',
      },
    ],
  },
  {
    id: 'luzverde',
    name: 'Luz Verde Elétrica',
    category: 'Eletricista',
    desc: 'Reparos rápidos e instalação de luminárias.',
    city: 'Venâncio Aires - RS',
    mode: 'Atende em domicílio',
    price: 'R$ 90 por visita',
    about:
      'Atendimento rápido em pequenos reparos elétricos: tomadas, interruptores, luminárias e ventiladores de teto.',
    services: [
      {
        name: 'Visita técnica',
        desc: 'Diagnóstico e pequenos reparos na mesma visita.',
        mode: 'Em domicílio',
        price: 'R$ 90',
      },
    ],
  },
  {
    id: 'aguaviva',
    name: 'Água Viva Hidráulica',
    category: 'Encanador',
    desc: 'Caixas d’água, filtros e reparos hidráulicos.',
    city: 'Lajeado - RS',
    mode: 'Atende em domicílio',
    price: 'A partir de R$ 100',
    about:
      'Limpeza e troca de caixa d’água, instalação de filtros e reparos hidráulicos em geral.',
    services: [
      {
        name: 'Limpeza de caixa d’água',
        desc: 'Higienização completa com laudo.',
        mode: 'Em domicílio',
        price: 'R$ 180',
      },
      {
        name: 'Troca de registro',
        desc: 'Substituição de registros e torneiras.',
        mode: 'Em domicílio',
        price: 'A partir de R$ 100',
      },
    ],
  },
  {
    id: 'desentupe',
    name: 'Desentupe Já',
    category: 'Encanador',
    desc: 'Desentupimento 24h com equipamento rotativo.',
    city: 'Vera Cruz - RS',
    mode: 'Ambos',
    price: '',
    address: 'Rua Coronel Oscar Jost, 310',
    about:
      'Desentupimento de esgoto, pias e caixas de gordura, com equipamento rotativo e atendimento de emergência.',
    services: [
      {
        name: 'Desentupimento de esgoto',
        desc: 'Equipamento rotativo, sem quebra-quebra.',
        mode: 'Em domicílio',
        price: 'Sob consulta',
      },
    ],
  },
  {
    id: 'vidro',
    name: 'Vidraçaria Central',
    category: 'Vidraceiro',
    desc: 'Box, espelhos, janelas e vidros temperados.',
    city: 'Venâncio Aires - RS',
    mode: 'Possui estabelecimento',
    price: '',
    address: 'Av. Osvaldo Aranha, 1220',
    about:
      'Vidros temperados sob medida, box, espelhos e janelas com instalação própria.',
    services: [
      {
        name: 'Box para banheiro',
        desc: 'Medição, corte e instalação.',
        mode: 'Em estabelecimento',
        price: 'Sob consulta',
      },
    ],
  },
  {
    id: 'vidroscs',
    name: 'Vidraçaria Bom Retiro',
    category: 'Vidraceiro',
    desc: 'Troca de vidros, box e espelhos sob medida.',
    city: 'Santa Cruz do Sul - RS',
    mode: 'Ambos',
    price: 'A partir de R$ 200',
    address: 'Rua Borges de Medeiros, 745',
    about:
      'Vidros comuns e temperados, box, espelhos e reposição de janelas, com loja no bairro Bom Retiro.',
    services: [
      {
        name: 'Troca de vidro',
        desc: 'Janelas e portas residenciais.',
        mode: 'Ambos',
        price: 'A partir de R$ 200',
      },
    ],
  },
  {
    id: 'temperado',
    name: 'Temper Vidros',
    category: 'Vidraceiro',
    desc: 'Fachadas, guarda-corpo e vidro temperado.',
    city: 'Lajeado - RS',
    mode: 'Possui estabelecimento',
    price: 'A partir de R$ 260',
    address: 'Rua Júlio de Castilhos, 88',
    about:
      'Vidro temperado para fachadas, guarda-corpo, portas e coberturas, com projeto e instalação.',
    services: [
      {
        name: 'Guarda-corpo de vidro',
        desc: 'Medição, ferragens e instalação.',
        mode: 'Em estabelecimento',
        price: 'A partir de R$ 260 por metro',
      },
    ],
  },
  {
    id: 'pintura',
    name: 'Pintura Nova Casa',
    category: 'Pintor',
    desc: 'Pintura residencial interna e externa, texturas.',
    city: 'Santa Cruz do Sul - RS',
    mode: 'Atende em domicílio',
    price: 'R$ 25 por m²',
    about: 'Pintura residencial e comercial, massa corrida, texturas e grafiato.',
    services: [
      {
        name: 'Pintura interna',
        desc: 'Paredes, forro e acabamento.',
        mode: 'Em domicílio',
        price: 'R$ 25 por m²',
      },
    ],
  },
  {
    id: 'cor',
    name: 'Cor & Cia Pinturas',
    category: 'Pintor',
    desc: 'Pintura externa, telhados e pintura epóxi.',
    city: 'Venâncio Aires - RS',
    mode: 'Atende em domicílio',
    price: 'R$ 22 por m²',
    about:
      'Pintura externa com preparação de superfície, impermeabilização de telhados e piso epóxi.',
    services: [
      {
        name: 'Pintura externa',
        desc: 'Lavagem, selador e duas demãos.',
        mode: 'Em domicílio',
        price: 'R$ 22 por m²',
      },
      {
        name: 'Piso epóxi',
        desc: 'Garagens e áreas de serviço.',
        mode: 'Em domicílio',
        price: 'Sob consulta',
      },
    ],
  },
  {
    id: 'grafiato',
    name: 'Grafiato Sul',
    category: 'Pintor',
    desc: 'Grafiato, textura projetada e efeitos decorativos.',
    city: 'Rio Pardo - RS',
    mode: 'Atende em domicílio',
    price: '',
    about:
      'Acabamentos decorativos: grafiato, textura projetada, cimento queimado e efeitos em parede.',
    services: [
      {
        name: 'Grafiato',
        desc: 'Aplicação em fachada ou parede interna.',
        mode: 'Em domicílio',
        price: 'Sob consulta',
      },
    ],
  },
  {
    id: 'clima',
    name: 'Clima Frio Ar-Condicionado',
    category: 'Ar-condicionado',
    desc: 'Instalação, higienização e recarga de gás.',
    city: 'Lajeado - RS',
    mode: 'Ambos',
    price: 'A partir de R$ 180',
    address: 'Rua Bento Rosa, 92',
    about: 'Instalação e manutenção de split residencial e comercial.',
    services: [
      {
        name: 'Instalação de split',
        desc: 'Até 12.000 BTUs, com suporte e tubulação.',
        mode: 'Em domicílio',
        price: 'A partir de R$ 180',
      },
    ],
  },
  {
    id: 'climascs',
    name: 'Ar Sul Climatização',
    category: 'Ar-condicionado',
    desc: 'Instalação e limpeza de split residencial.',
    city: 'Santa Cruz do Sul - RS',
    mode: 'Atende em domicílio',
    price: 'A partir de R$ 160',
    about:
      'Instalação, higienização e recarga de gás em aparelhos split e janela.',
    services: [
      {
        name: 'Higienização de split',
        desc: 'Limpeza completa com produto próprio.',
        mode: 'Em domicílio',
        price: 'R$ 160',
      },
    ],
  },
  {
    id: 'friomax',
    name: 'FrioMax Refrigeração',
    category: 'Ar-condicionado',
    desc: 'Câmaras frias, expositores e ar comercial.',
    city: 'Venâncio Aires - RS',
    mode: 'Ambos',
    price: 'A partir de R$ 150',
    address: 'Rua Tiradentes, 507',
    about:
      'Refrigeração comercial: câmaras frias, expositores, balcões e climatização de lojas.',
    services: [
      {
        name: 'Manutenção de expositor',
        desc: 'Diagnóstico, gás e troca de componentes.',
        mode: 'Ambos',
        price: 'A partir de R$ 150',
      },
    ],
  },
  {
    id: 'jardim',
    name: 'Verde Vivo Jardinagem',
    category: 'Jardinagem',
    desc: 'Corte de grama, poda e manutenção de jardins.',
    city: 'Santa Cruz do Sul - RS',
    mode: 'Atende em domicílio',
    price: 'A partir de R$ 110',
    about:
      'Manutenção de jardins residenciais e condomínios: corte de grama, poda de árvores e limpeza de pátio.',
    services: [
      {
        name: 'Corte de grama',
        desc: 'Até 300 m², com recolhimento.',
        mode: 'Em domicílio',
        price: 'A partir de R$ 110',
      },
    ],
  },
  {
    id: 'paisagem',
    name: 'Paisagem Viva',
    category: 'Jardinagem',
    desc: 'Projeto de paisagismo e jardins de inverno.',
    city: 'Vera Cruz - RS',
    mode: 'Atende em domicílio',
    price: 'A partir de R$ 130',
    about:
      'Paisagismo residencial: projeto, escolha de espécies, execução e manutenção de jardins.',
    services: [
      {
        name: 'Projeto de paisagismo',
        desc: 'Levantamento, projeto e lista de espécies.',
        mode: 'Em domicílio',
        price: 'A partir de R$ 450',
      },
      {
        name: 'Manutenção mensal',
        desc: 'Poda, adubação e controle de pragas.',
        mode: 'Em domicílio',
        price: 'A partir de R$ 130',
      },
    ],
  },
  {
    id: 'tecinfo',
    name: 'TecInfo Assistência',
    category: 'Informática',
    desc: 'Formatação, upgrade e remoção de vírus.',
    city: 'Santa Cruz do Sul - RS',
    mode: 'Possui estabelecimento',
    price: 'R$ 100',
    address: 'Rua Ramiro Barcelos, 305 - Sala 4',
    about: 'Assistência técnica para notebooks e desktops, com bancada própria.',
    services: [
      {
        name: 'Formatação completa',
        desc: 'Backup, instalação e drivers.',
        mode: 'Em estabelecimento',
        price: 'R$ 100',
      },
    ],
  },
  {
    id: 'bitlab',
    name: 'BitLab Informática',
    category: 'Informática',
    desc: 'Troca de tela, teclado e recuperação de dados.',
    city: 'Lajeado - RS',
    mode: 'Ambos',
    price: 'R$ 120',
    address: 'Rua Silva Jardim, 220',
    about:
      'Reparo de notebooks em nível de placa, troca de tela e teclado, e recuperação de dados de HD e SSD.',
    services: [
      {
        name: 'Troca de tela',
        desc: 'Notebook, com peça e garantia de 90 dias.',
        mode: 'Em estabelecimento',
        price: 'A partir de R$ 420',
      },
      {
        name: 'Recuperação de dados',
        desc: 'HD e SSD, orçamento após diagnóstico.',
        mode: 'Em estabelecimento',
        price: 'R$ 120',
      },
    ],
  },
  {
    id: 'ana',
    name: 'Diarista Ana Lima',
    category: 'Limpeza',
    desc: 'Limpeza residencial e pós-obra.',
    city: 'Santa Cruz do Sul - RS',
    mode: 'Atende em domicílio',
    price: 'R$ 160 por diária',
    about: 'Limpeza residencial, pós-obra e organização, com material incluso.',
    services: [
      {
        name: 'Diária de limpeza',
        desc: 'Até 8 horas, material incluso.',
        mode: 'Em domicílio',
        price: 'R$ 160',
      },
    ],
  },
  {
    id: 'brilho',
    name: 'Brilho Total Limpeza',
    category: 'Limpeza',
    desc: 'Limpeza de sofá, colchão e tapetes.',
    city: 'Venâncio Aires - RS',
    mode: 'Atende em domicílio',
    price: 'R$ 180 por diária',
    about:
      'Higienização de estofados a seco, limpeza de colchões, tapetes e cortinas.',
    services: [
      {
        name: 'Higienização de sofá',
        desc: 'Até 3 lugares, secagem em 4 horas.',
        mode: 'Em domicílio',
        price: 'R$ 180',
      },
    ],
  },
  {
    id: 'posobra',
    name: 'Limpeza Pós-Obra Sul',
    category: 'Limpeza',
    desc: 'Limpeza fina pós-obra e entrega de imóvel.',
    city: 'Lajeado - RS',
    mode: 'Atende em domicílio',
    price: '',
    about:
      'Limpeza grossa e fina depois da obra: remoção de respingos, vidros, rejunte e entrega do imóvel pronto.',
    services: [
      {
        name: 'Limpeza pós-obra',
        desc: 'Equipe própria, orçamento por m².',
        mode: 'Em domicílio',
        price: 'Sob consulta',
      },
    ],
  },
  {
    id: 'chave',
    name: 'Marcos Chaveiro 24h',
    category: 'Chaveiro',
    desc: 'Abertura de portas, cópias e troca de segredo.',
    city: 'Santa Cruz do Sul - RS',
    mode: 'Atende em domicílio',
    price: 'A partir de R$ 70',
    about:
      'Atendimento 24 horas em abertura de portas, cópias de chave e troca de segredo.',
    services: [
      {
        name: 'Abertura de porta',
        desc: 'Sem danos à fechadura.',
        mode: 'Em domicílio',
        price: 'A partir de R$ 70',
      },
    ],
  },
  {
    id: 'chaverp',
    name: 'Chaveiro Rio Pardo',
    category: 'Chaveiro',
    desc: 'Chaves codificadas, controles e fechaduras.',
    city: 'Rio Pardo - RS',
    mode: 'Ambos',
    price: 'A partir de R$ 80',
    address: 'Rua Andrade Neves, 64',
    about:
      'Chaves codificadas de veículo, controles de portão, fechaduras digitais e troca de segredo.',
    services: [
      {
        name: 'Chave codificada',
        desc: 'Cópia e programação de chave automotiva.',
        mode: 'Em estabelecimento',
        price: 'A partir de R$ 180',
      },
    ],
  },
  {
    id: 'obra',
    name: 'Construtora Pedra Nova',
    category: 'Pedreiro',
    desc: 'Alvenaria, contrapiso e pequenas reformas.',
    city: 'Santa Cruz do Sul - RS',
    mode: 'Atende em domicílio',
    price: '',
    about:
      'Alvenaria, contrapiso, assentamento de piso e reformas residenciais com equipe própria.',
    services: [
      {
        name: 'Reforma de banheiro',
        desc: 'Demolição, hidráulica, assentamento e acabamento.',
        mode: 'Em domicílio',
        price: 'Sob consulta',
      },
    ],
  },
  {
    id: 'reforma',
    name: 'Reformas Express',
    category: 'Pedreiro',
    desc: 'Pequenos reparos, gesso e assentamento.',
    city: 'Lajeado - RS',
    mode: 'Atende em domicílio',
    price: 'A partir de R$ 200',
    about:
      'Pequenos serviços de obra: reparo de alvenaria, gesso, assentamento de piso e rejunte.',
    services: [
      {
        name: 'Reparo de alvenaria',
        desc: 'Trincas, rebocos e acabamento.',
        mode: 'Em domicílio',
        price: 'A partir de R$ 200',
      },
    ],
  },
  {
    id: 'moveis',
    name: 'Móveis Sob Medida Vale',
    category: 'Marceneiro',
    desc: 'Cozinhas planejadas, closets e painéis.',
    city: 'Venâncio Aires - RS',
    mode: 'Ambos',
    price: 'A partir de R$ 900',
    address: 'Rua Marechal Deodoro, 1502',
    about:
      'Cozinhas, closets, home office e painéis sob medida em MDF, com projeto e montagem inclusos.',
    services: [
      {
        name: 'Cozinha planejada',
        desc: 'Projeto, produção e montagem.',
        mode: 'Ambos',
        price: 'A partir de R$ 4.500',
      },
      {
        name: 'Painel de TV',
        desc: 'MDF com nichos e passagem de cabos.',
        mode: 'Ambos',
        price: 'A partir de R$ 900',
      },
    ],
  },
];

/* ───────────────────────────────────────────────────────────────────────────
   Placeholder imagery
   Stand-in photos keyed to the trade, so a marcenaria's portfolio shows
   woodwork instead of stock noise. `lock` pins each URL to one image, so the
   page does not reshuffle on every load.

   To go live: drop this block, put the uploaded URLs on `photoUrl` / `photos`
   in the catalogue above, and nothing downstream changes.
   ─────────────────────────────────────────────────────────────────────────── */

const PHOTO_KEYWORDS: Record<string, string> = {
  Eletricista: 'electrician,wiring',
  Encanador: 'plumbing,pipes',
  Vidraceiro: 'glazier,glass',
  Pintor: 'housepainter,painting',
  'Ar-condicionado': 'air-conditioner,hvac',
  Jardinagem: 'gardening,landscaping',
  Informática: 'computer,repair',
  Limpeza: 'cleaning,housekeeping',
  Chaveiro: 'locksmith,keys',
  Marceneiro: 'carpentry,woodworking',
  Pedreiro: 'masonry,bricklayer',
};

function placeholder(category: string, lock: number, w: number, h: number) {
  const topic = PHOTO_KEYWORDS[category] ?? 'handyman,tools';
  return `https://loremflickr.com/${w}/${h}/${topic}?lock=${lock}`;
}

/**
 * Not every business has artwork on file: roughly two in three get a logo and
 * one in three a portfolio, so both states show up in the listing and the
 * layout has to hold either way.
 */
export const PROVIDERS: Provider[] = RAW_PROVIDERS.map((provider, i) => ({
  ...provider,
  ...(i % 3 !== 2 && {
    photoUrl: placeholder(provider.category, i * 7 + 1, 240, 240),
  }),
  ...(i % 3 === 0 && {
    /* Locks spread far apart: consecutive ones tend to land on near-identical
       shots from the same photo set. */
    photos: Array.from({ length: 3 }, (_, n) =>
      placeholder(provider.category, ((i * 97 + n * 313 + 11) % 900) + 20, 640, 480),
    ),
  }),
}));

/** Distinct values pulled from the catalogue, so a filter can never drift from the data. */
function distinct<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export const CATEGORIES = distinct(PROVIDERS.map((p) => p.category)).sort(
  (a, b) => a.localeCompare(b, 'pt-BR'),
);

export const CITIES = [
  ...distinct(PROVIDERS.map((p) => p.city)).sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  ),
  ALL_CITIES,
];

/** Categories on the home tiles: the busiest first, ties broken alphabetically. */
export const FEATURED_CATEGORIES = [...CATEGORIES]
  .sort((a, b) => {
    const byCount =
      PROVIDERS.filter((p) => p.category === b).length -
      PROVIDERS.filter((p) => p.category === a).length;
    return byCount !== 0 ? byCount : a.localeCompare(b, 'pt-BR');
  })
  .slice(0, 8);

export const FILTER_CATEGORIES = CATEGORIES;

/** Every category a provider can register a service under. */
export const SERVICE_CATEGORIES = distinct([
  ...CATEGORIES,
  'Diarista',
  'Fotógrafo',
  'Mecânico',
  'Serralheiro',
  'Técnico de informática',
]).sort((a, b) => a.localeCompare(b, 'pt-BR'));

/**
 * Plural headline form. Categories that are already mass nouns
 * ("Jardinagem", "Limpeza") map to themselves.
 */
export const CATEGORY_PLURAL: Record<string, string> = {
  Eletricista: 'Eletricistas',
  Encanador: 'Encanadores',
  Pintor: 'Pintores',
  Vidraceiro: 'Vidraceiros',
  Chaveiro: 'Chaveiros',
  Pedreiro: 'Pedreiros',
  Marceneiro: 'Marceneiros',
  'Ar-condicionado': 'Ar-condicionado',
  Jardinagem: 'Jardinagem',
  Informática: 'Informática',
  Limpeza: 'Limpeza',
};

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

/**
 * City names as typed in the search box — accented and unaccented, so
 * "venancio aires" finds Venâncio Aires. Derived, so a new city in the
 * catalogue is searchable without touching this list.
 */
export const CITY_SEARCH_TERMS = distinct(
  PROVIDERS.flatMap((p) => {
    const name = p.city.replace(' - RS', '').toLowerCase();
    return [name, stripAccents(name)];
  }),
);

/** The signed-in provider's own services (panel seed data). */
export const OWN_SERVICES: OwnedService[] = [
  {
    id: 1,
    name: 'Instalação elétrica',
    category: 'Eletricista',
    description: 'Instalações e manutenção elétrica residencial.',
    mode: 'Em domicílio',
    priceType: 'A partir de',
    priceAmount: '150',
  },
  {
    id: 2,
    name: 'Troca de chuveiro',
    category: 'Eletricista',
    description: 'Substituição de chuveiro e disjuntor, com teste de carga.',
    mode: 'Em domicílio',
    priceType: 'Valor fixo',
    priceAmount: '80',
  },
  {
    id: 3,
    name: 'Instalação de ventilador de teto',
    category: 'Eletricista',
    description: 'Montagem, fixação e ligação do controle de velocidade.',
    mode: 'Em domicílio',
    priceType: 'Valor fixo',
    priceAmount: '120',
  },
];

/** The provider whose panel is shown — stands in for the session user. */
export const SIGNED_IN_PROVIDER_ID = 'joao';

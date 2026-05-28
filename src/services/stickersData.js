export const ALBUM_GROUPS = [
  {
    name: 'Grupo A',
    teams: [
      { name: 'México', prefix: 'MEX' },
      { name: 'África do Sul', prefix: 'RSA' },
      { name: 'Coreia do Sul', prefix: 'KOR' },
      { name: 'Rep. Tcheca', prefix: 'CZE' },
    ],
  },
  {
    name: 'Grupo B',
    teams: [
      { name: 'Canadá', prefix: 'CAN' },
      { name: 'Bósnia', prefix: 'BIH' },
      { name: 'Catar', prefix: 'QAT' },
      { name: 'Suíça', prefix: 'SUI' },
    ],
  },
  {
    name: 'Grupo C',
    teams: [
      { name: 'Brasil', prefix: 'BRA' },
      { name: 'Marrocos', prefix: 'MAR' },
      { name: 'Haiti', prefix: 'HAI' },
      { name: 'Escócia', prefix: 'SCO' },
    ],
  },
  {
    name: 'Grupo D',
    teams: [
      { name: 'Estados Unidos', prefix: 'USA' },
      { name: 'Paraguai', prefix: 'PAR' },
      { name: 'Austrália', prefix: 'AUS' },
      { name: 'Turquia', prefix: 'TUR' },
    ],
  },
  {
    name: 'Grupo E',
    teams: [
      { name: 'Alemanha', prefix: 'GER' },
      { name: 'Curaçao', prefix: 'CUW' },
      { name: 'Costa do Marfim', prefix: 'CIV' },
      { name: 'Equador', prefix: 'ECU' },
    ],
  },
  {
    name: 'Grupo F',
    teams: [
      { name: 'Holanda', prefix: 'NED' },
      { name: 'Japão', prefix: 'JPN' },
      { name: 'Suécia', prefix: 'SWE' },
      { name: 'Tunísia', prefix: 'TUN' },
    ],
  },
  {
    name: 'Grupo G',
    teams: [
      { name: 'Bélgica', prefix: 'BEL' },
      { name: 'Egito', prefix: 'EGY' },
      { name: 'Irã', prefix: 'IRN' },
      { name: 'Nova Zelândia', prefix: 'NZL' },
    ],
  },
  {
    name: 'Grupo H',
    teams: [
      { name: 'Espanha', prefix: 'ESP' },
      { name: 'Cabo Verde', prefix: 'CPV' },
      { name: 'Arábia Saudita', prefix: 'KSA' },
      { name: 'Uruguai', prefix: 'URU' },
    ],
  },
  {
    name: 'Grupo I',
    teams: [
      { name: 'França', prefix: 'FRA' },
      { name: 'Senegal', prefix: 'SEN' },
      { name: 'Iraque', prefix: 'IRQ' },
      { name: 'Noruega', prefix: 'NOR' },
    ],
  },
  {
    name: 'Grupo J',
    teams: [
      { name: 'Argentina', prefix: 'ARG' },
      { name: 'Argélia', prefix: 'ALG' },
      { name: 'Áustria', prefix: 'AUT' },
      { name: 'Jordânia', prefix: 'JOR' },
    ],
  },
  {
    name: 'Grupo K',
    teams: [
      { name: 'Portugal', prefix: 'POR' },
      { name: 'Congo', prefix: 'COD' },
      { name: 'Uzbequistão', prefix: 'UZB' },
      { name: 'Colômbia', prefix: 'COL' },
    ],
  },
  {
    name: 'Grupo L',
    teams: [
      { name: 'Inglaterra', prefix: 'ENG' },
      { name: 'Croácia', prefix: 'CRO' },
      { name: 'Gana', prefix: 'GHA' },
      { name: 'Panamá', prefix: 'PAN' },
    ],
  },
  {
    name: 'Página Inicial',
    teams: [
      { name: 'Página Inicial', prefix: 'FWC' },
    ],
    customRange: { FWC: { start: 0, end: 8, zeroPad: true } },
  },
  {
    name: 'FIFA World Cup History',
    teams: [
      { name: 'FWC History', prefix: 'FWC' },
    ],
    customRange: { FWC: { start: 9, end: 19 } },
  },
  {
    name: 'Figurinhas Coca-Cola',
    teams: [
      { name: 'Coca-Cola', prefix: 'CC' },
    ],
    customRange: { CC: { start: 1, end: 14 } },
  },
]

// Cada time tem figurinhas de 1 a 20, exceto grupos com customRange
const STICKERS_PER_TEAM = 20

export function getAllStickers() {
  const list = []
  ALBUM_GROUPS.forEach((group) => {
    group.teams.forEach((team) => {
      const range = group.customRange?.[team.prefix]
      const start = range?.start ?? 1
      const end = range?.end ?? STICKERS_PER_TEAM
      const zeroPad = range?.zeroPad ?? false
      for (let i = start; i <= end; i++) {
        const num = zeroPad ? String(i).padStart(2, '0') : i
        list.push({ key: `${team.prefix}${num}`, group: group.name, team: team.name, prefix: team.prefix, num: i })
      }
    })
  })
  return list
}

export function getTotalCount() {
  return getAllStickers().length
}

// Figurinhas brilhantes: número 1 de cada seleção (grupos A-L)
// Exclui grupos especiais (FWC, CC)
const SHINY_PREFIXES = new Set(
  ALBUM_GROUPS
    .filter((g) => !g.customRange)
    .flatMap((g) => g.teams.map((t) => t.prefix))
)

export function isShiny(key) {
  // key ex: BRA1, MEX1, ENG1
  for (const prefix of SHINY_PREFIXES) {
    if (key === `${prefix}1`) return true
  }
  return false
}

export function getAllShinyKeys() {
  return [...SHINY_PREFIXES].map((p) => `${p}1`)
}

// Figurinhas de foto da equipe: número 13 de cada seleção (grupos A-L)
const TEAM_PHOTO_PREFIXES = new Set(
  ALBUM_GROUPS
    .filter((g) => !g.customRange)
    .flatMap((g) => g.teams.map((t) => t.prefix))
)

export function isTeamPhoto(key) {
  for (const prefix of TEAM_PHOTO_PREFIXES) {
    if (key === `${prefix}13`) return true
  }
  return false
}

export function getAllTeamPhotoKeys() {
  return [...TEAM_PHOTO_PREFIXES].map((p) => `${p}13`)
}

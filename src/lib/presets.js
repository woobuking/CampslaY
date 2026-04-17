export const PRESETS = [
  { id: 'P01', label: '에도쉘 캠프닉', tent: 'edoshell',      season: 'spring_fall', nights: 0, heater: false, igt: 'none'  },
  { id: 'P02', tent: 'edoshell',      season: 'spring_fall', nights: 1, heater: false, igt: 'none'  },
  { id: 'P03', tent: 'stego',         season: 'spring_fall', nights: 1, heater: false, igt: 'basic' },
  { id: 'P04', tent: 'stego',         season: 'spring_fall', nights: 1, heater: false, igt: 'full'  },
  { id: 'P05', tent: 'stego',         season: 'winter',      nights: 1, heater: true,  igt: 'full'  },
  { id: 'P06', tent: 'dome_tarp',     season: 'summer',      nights: 1, heater: false, igt: 'basic' },
  { id: 'P07', tent: 'dome_tarp',     season: 'summer',      nights: 1, heater: false, igt: 'full'  },
  { id: 'P08', tent: 'dome_edoshell', season: 'summer',      nights: 1, heater: false, igt: 'basic' },
  { id: 'P09', tent: 'dome_edoshell', season: 'summer',      nights: 1, heater: false, igt: 'full'  },
]

const DEFAULT_PEOPLE = {
  edoshell: 1,
  stego: 2,
  dome_tarp: 2,
  dome_edoshell: 2,
}

export function getDefaultPeople(tent) {
  return DEFAULT_PEOPLE[tent] ?? 1
}

export function getDefaultIgt(tent, season) {
  if (tent === 'edoshell') return 'none'
  return season === 'winter' ? 'full' : 'basic'
}

export function normalizeInput(input = {}) {
  const tent = input.tent ?? 'edoshell'
  const season = input.season ?? 'spring_fall'
  const nights = Number(input.nights)
  const people = Number(input.people)

  return {
    tent,
    nights: Number.isFinite(nights) ? nights : 0,
    season,
    heater: season === 'winter' ? true : Boolean(input.heater),
    igt: input.igt ?? getDefaultIgt(tent, season),
    people: Number.isFinite(people) && people > 0 ? people : getDefaultPeople(tent),
  }
}

export function findPreset(input) {
  return PRESETS.find(p =>
    p.tent === input.tent &&
    p.season === input.season &&
    p.nights === input.nights &&
    p.igt === input.igt
  )
}

export function getPresetId(input) {
  return findPreset(input)?.id ?? null
}

export function getSavedPresetMap(savedPresets = []) {
  return savedPresets.reduce((acc, savedPreset) => {
    const normalized = normalizeInput(savedPreset.input)
    const presetId = getPresetId(normalized)
    if (!presetId) return acc

    const current = acc[presetId]
    if (!current || new Date(savedPreset.created_at) >= new Date(current.created_at)) {
      acc[presetId] = savedPreset
    }
    return acc
  }, {})
}

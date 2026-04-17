export const PRESETS = [
  { id: 'P01', tent: 'edoshell',      season: 'spring_fall', nights: 0, heater: false, igt: 'none'  },
  { id: 'P02', tent: 'edoshell',      season: 'spring_fall', nights: 1, heater: false, igt: 'none'  },
  { id: 'P03', tent: 'stego',         season: 'spring_fall', nights: 1, heater: false, igt: 'basic' },
  { id: 'P04', tent: 'stego',         season: 'spring_fall', nights: 1, heater: false, igt: 'full'  },
  { id: 'P05', tent: 'stego',         season: 'winter',      nights: 1, heater: true,  igt: 'full'  },
  { id: 'P06', tent: 'dome_tarp',     season: 'summer',      nights: 1, heater: false, igt: 'basic' },
  { id: 'P07', tent: 'dome_tarp',     season: 'summer',      nights: 1, heater: false, igt: 'full'  },
  { id: 'P08', tent: 'dome_edoshell', season: 'summer',      nights: 1, heater: false, igt: 'basic' },
  { id: 'P09', tent: 'dome_edoshell', season: 'summer',      nights: 1, heater: false, igt: 'full'  },
]

export function findPreset(input) {
  return PRESETS.find(p =>
    p.tent === input.tent &&
    p.season === input.season &&
    p.nights === input.nights &&
    p.igt === input.igt
  )
}

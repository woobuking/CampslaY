export const FOOD_PRESETS = {
  edoshell_solo: {
    base: [
      '물 2L',
      '햇반 3개',
      '짜파게티 2개',
      '오징어짬뽕 1개',
      '과자',
      '하이네캔 3캔',
      '와사비',
      '고기',
      '종량제 봉투',
    ],
    per_night: {
      물: '2L',
      햇반: 3,
    },
  },
  family_camp: {
    base: [
      '밀키트',
      '짜파게티 3개',
      '오징어짬뽕 2개',
      '과자',
      '하이네캔 4캔',
      '고기용 와사비',
      '고기',
      '쓰레기 비닐',
    ],
    per_night_per_person: {
      물: '2L',
      햇반: 2,
    },
  },
}

export function getFoodPreset(tent) {
  return tent === 'edoshell'
    ? FOOD_PRESETS.edoshell_solo
    : FOOD_PRESETS.family_camp
}

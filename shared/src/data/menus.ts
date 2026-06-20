import type { MenuItem } from '../types/menu.js'

export const MENU_ITEMS: MenuItem[] = [
  // --- McDonalds (office_building) — skyndibiti: ódýrt, hófleg líðan ---
  {
    id: 'mcd_burger',
    locationId: 'office_building',
    name: 'Hamborgari',
    icon: '🍔',
    price: 600,
    effects: [
      { stat: 'wellbeing', value: 5 },
      { stat: 'stress', value: -3 },
    ],
    description: 'Klassískur hamborgari',
  },
  {
    id: 'mcd_fries',
    locationId: 'office_building',
    name: 'Franskar',
    icon: '🍟',
    price: 350,
    effects: [
      { stat: 'wellbeing', value: 3 },
      { stat: 'stress', value: -2 },
    ],
    description: 'Stökkar franskar kartöflur',
  },
  {
    id: 'mcd_combo',
    locationId: 'office_building',
    name: 'BigMac máltíð',
    icon: '🍔',
    price: 1100,
    effects: [
      { stat: 'wellbeing', value: 8 },
      { stat: 'stress', value: -5 },
    ],
    description: 'Borgari, franskar og gos',
  },
  {
    id: 'mcd_shake',
    locationId: 'office_building',
    name: 'Mjólkurhristingur',
    icon: '🥤',
    price: 450,
    effects: [
      { stat: 'wellbeing', value: 4 },
      { stat: 'stress', value: -2 },
    ],
    description: 'Kaldur og sætur hristingur',
  },

  // --- Veitingastaður (school) — fínt: dýrara, meiri líðan og orðspor ---
  {
    id: 'res_pasta',
    locationId: 'school',
    name: 'Pasta',
    icon: '🍝',
    price: 1600,
    effects: [
      { stat: 'wellbeing', value: 9 },
      { stat: 'stress', value: -6 },
      { stat: 'reputation', value: 1 },
    ],
    description: 'Heimagert pasta dagsins',
  },
  {
    id: 'res_sushi',
    locationId: 'school',
    name: 'Sushi',
    icon: '🍣',
    price: 2600,
    effects: [
      { stat: 'wellbeing', value: 11 },
      { stat: 'stress', value: -7 },
      { stat: 'reputation', value: 2 },
    ],
    description: 'Ferskt sushi-úrval',
  },
  {
    id: 'res_steak',
    locationId: 'school',
    name: 'Nautasteik',
    icon: '🥩',
    price: 3200,
    effects: [
      { stat: 'wellbeing', value: 14 },
      { stat: 'stress', value: -9 },
      { stat: 'reputation', value: 3 },
    ],
    description: 'Meyr nautasteik með meðlæti',
  },
  {
    id: 'res_course',
    locationId: 'school',
    name: 'Þriggja rétta máltíð',
    icon: '🍽️',
    price: 4800,
    effects: [
      { stat: 'wellbeing', value: 18 },
      { stat: 'stress', value: -12 },
      { stat: 'reputation', value: 4 },
    ],
    description: 'Forréttur, aðalréttur og eftirréttur',
  },
]

export function getMenuItemById(id: string): MenuItem | undefined {
  return MENU_ITEMS.find(m => m.id === id)
}

export function getMenuItemsByLocation(locationId: string): MenuItem[] {
  return MENU_ITEMS.filter(m => m.locationId === locationId)
}

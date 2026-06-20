import type { BoardLocation } from '../types/board.js'

export const BOARD_LOCATIONS: BoardLocation[] = [
  // --- STARFATORG / Employment District ---
  {
    id: 'employment_office',
    name: 'Vinnumiðlun',
    type: 'employment',
    icon: '🏢',
    description: 'Leita að vinnu og sækja um störf',
    position: { x: 2, y: 1 },
    linkedLocationIds: ['tech_company', 'hospital', 'school', 'retail_store'],
    actions: [
      { type: 'apply_job', label: 'Sækja um starf', timeCost: 1, description: 'Skoða laus störf og sækja um' },
    ],
  },

  // --- VINNUSTAÐIR / Workplaces ---
  {
    id: 'tech_company',
    name: 'Tæknifyrirtæki',
    type: 'workplace',
    icon: '💻',
    description: 'Vinna við tækni og þróun hugbúnaðar',
    position: { x: 4, y: 1 },
    linkedLocationIds: ['employment_office', 'university'],
    jobIds: ['office_worker', 'programmer', 'accountant', 'senior_developer', 'manager', 'cto'],
    actions: [
      { type: 'work', label: 'Vinna', timeCost: 1, description: 'Vinna daginn' },
      { type: 'apply_job', label: 'Sækja um starf', timeCost: 1, description: 'Sækja um starf hér' },
    ],
  },
  {
    id: 'hospital',
    name: 'Sjúkrahús',
    type: 'workplace',
    icon: '🏥',
    description: 'Heilbrigðisþjónusta og umönnun',
    position: { x: 6, y: 2 },
    linkedLocationIds: ['employment_office', 'university', 'gym'],
    jobIds: ['nurse', 'doctor'],
    actions: [
      { type: 'work', label: 'Vinna', timeCost: 1, description: 'Vinna vakt' },
      { type: 'apply_job', label: 'Sækja um starf', timeCost: 1, description: 'Sækja um starf hér' },
    ],
  },
  {
    id: 'office_building',
    name: 'McDonalds',
    type: 'workplace',
    icon: '🍔',
    description: 'Skyndibitastaður — afgreiðsla og eldhús',
    position: { x: 3, y: 3 },
    linkedLocationIds: ['employment_office', 'social_club'],
    jobIds: ['fast_food', 'cashier'],
    actions: [
      { type: 'work', label: 'Vinna', timeCost: 1, description: 'Vinna vakt' },
      { type: 'buy_meal', label: 'Kaupa máltíð', timeCost: 1, description: 'Fá sér skyndibita' },
      { type: 'apply_job', label: 'Sækja um starf', timeCost: 1, description: 'Sækja um starf hér' },
    ],
  },
  {
    id: 'retail_store',
    name: 'Verslun',
    type: 'workplace',
    icon: '🛒',
    description: 'Verslun og þjónusta við viðskiptavini',
    position: { x: 1, y: 3 },
    linkedLocationIds: ['employment_office', 'market'],
    jobIds: ['cashier', 'manual_labor'],
    actions: [
      { type: 'work', label: 'Vinna', timeCost: 1, description: 'Vinna vakt' },
      { type: 'apply_job', label: 'Sækja um starf', timeCost: 1, description: 'Sækja um starf hér' },
    ],
  },
  {
    id: 'school',
    name: 'Veitingastaður',
    type: 'workplace',
    icon: '🍽️',
    description: 'Fínn veitingastaður — matreiðsla og þjónusta',
    position: { x: 5, y: 1 },
    linkedLocationIds: ['employment_office', 'university'],
    jobIds: ['waiter', 'chef'],
    actions: [
      { type: 'work', label: 'Vinna', timeCost: 1, description: 'Vinna vakt' },
      { type: 'buy_meal', label: 'Borða máltíð', timeCost: 1, description: 'Snæða á veitingastaðnum' },
      { type: 'apply_job', label: 'Sækja um starf', timeCost: 1, description: 'Sækja um starf hér' },
    ],
  },

  // --- MENNTUN / Education ---
  {
    id: 'university',
    name: 'Háskóli',
    type: 'education',
    icon: '🎓',
    description: 'Stunda háskólanám í ýmsum greinum',
    position: { x: 5, y: 0 },
    linkedLocationIds: ['tech_company', 'school', 'library'],
    educationIds: ['cs_degree', 'business_degree', 'medicine', 'arts_degree'],
    actions: [
      { type: 'study', label: 'Stunda nám', timeCost: 1, moneyCost: 800, description: 'Taka áfanga í háskóla' },
    ],
  },
  {
    id: 'library',
    name: 'Bókasafn',
    type: 'education',
    icon: '📖',
    description: 'Sjálfstætt nám og rannsóknir',
    position: { x: 4, y: 0 },
    linkedLocationIds: ['university', 'social_club'],
    actions: [
      { type: 'study', label: 'Lesa og læra', timeCost: 1, description: 'Sjálfstætt nám, hægara en skóli en frítt' },
      { type: 'practice_hobby', label: 'Skrifa', timeCost: 1, description: 'Æfa hobbyið "skrif"' },
    ],
  },
  {
    id: 'online_courses',
    name: 'Netnámskeið',
    type: 'education',
    icon: '💡',
    description: 'Taka námskeið á netinu heiman frá',
    position: { x: 1, y: 0 },
    linkedLocationIds: ['apartment_budget', 'apartment_mid'],
    actions: [
      { type: 'study', label: 'Taka námskeið', timeCost: 1, moneyCost: 300, description: 'Fljótlegra en skóli en minna þekking' },
    ],
  },

  // --- ÍBÚÐAR / Housing ---
  {
    id: 'apartment_budget',
    name: 'Ódýr íbúð',
    type: 'housing',
    icon: '🏠',
    description: 'Lítil en hagkvæm íbúð',
    position: { x: 0, y: 2 },
    linkedLocationIds: ['retail_store', 'park', 'online_courses'],
    actions: [
      { type: 'rest', label: 'Hvílast', timeCost: 1, description: '-stress, +líðan' },
      { type: 'upgrade_housing', label: 'Flytja í betri íbúð', timeCost: 1, moneyCost: 5000, description: 'Uppfæra í meðal íbúð (leiga 1.500 kr/viku)' },
    ],
  },
  {
    id: 'apartment_mid',
    name: 'Meðal íbúð',
    type: 'housing',
    icon: '🏡',
    description: 'Þægileg og rúmgæg íbúð',
    position: { x: 0, y: 3 },
    linkedLocationIds: ['market', 'park', 'gym'],
    actions: [
      { type: 'rest', label: 'Hvílast', timeCost: 1, description: '-stress, +líðan (meiri en ódýr)' },
      { type: 'upgrade_housing', label: 'Flytja í lúxus íbúð', timeCost: 1, moneyCost: 20000, description: 'Uppfæra í bestu íbúð (leiga 4.000 kr/viku)' },
    ],
  },
  {
    id: 'apartment_luxury',
    name: 'Lúxus íbúð',
    type: 'housing',
    icon: '🏰',
    description: 'Eitt fegursta í borginni',
    position: { x: 0, y: 4 },
    linkedLocationIds: ['social_club', 'gym'],
    actions: [
      { type: 'rest', label: 'Hvílast', timeCost: 1, description: '-stress, +líðan (há bonus)' },
    ],
  },

  // --- VERSLANIR / Shops ---
  {
    id: 'market',
    name: 'Markaður',
    type: 'shop',
    icon: '🛍️',
    description: 'Kaupa mat og nauðsynjar',
    position: { x: 2, y: 4 },
    linkedLocationIds: ['apartment_mid', 'retail_store'],
    actions: [
      { type: 'shop_food', label: 'Kaupa mat', timeCost: 1, moneyCost: 500, description: '+líðan, -streita' },
    ],
  },
  {
    id: 'clothing_store',
    name: 'Fataverzlun',
    type: 'shop',
    icon: '👔',
    description: 'Kaupa föt og bæta útlit',
    position: { x: 3, y: 4 },
    linkedLocationIds: ['market', 'social_club'],
    actions: [
      { type: 'shop_clothes', label: 'Kaupa föt', timeCost: 1, moneyCost: 2000, description: '+orðspor, +líðan' },
    ],
  },

  // --- FÉLAGSLEGAR STAÐIR / Social ---
  {
    id: 'social_club',
    name: 'Félagsmiðstöð',
    type: 'social',
    icon: '🎉',
    description: 'Hittast við vini og stofna hópa',
    position: { x: 4, y: 4 },
    linkedLocationIds: ['park', 'apartment_luxury', 'music_studio', 'art_studio'],
    actions: [
      { type: 'socialize', label: 'Hittast við vini', timeCost: 1, description: '+tengsl, +líðan, -streita' },
      { type: 'form_group', label: 'Stofna hóp', timeCost: 1, description: 'Stofna group activity' },
      { type: 'join_group', label: 'Taka þátt í hópi', timeCost: 1, description: 'Ganga í núverandi hóp' },
    ],
  },
  {
    id: 'park',
    name: 'Garðurinn',
    type: 'park',
    icon: '🌳',
    description: 'Frjáls náttúra til hvíldar og umhugsunar',
    position: { x: 2, y: 3 },
    linkedLocationIds: ['gym', 'social_club', 'apartment_budget'],
    actions: [
      { type: 'rest', label: 'Ganga í garðinum', timeCost: 1, description: '-streita, +líðan, +heppni' },
      { type: 'practice_hobby', label: 'Líkamsrækt úti', timeCost: 1, description: 'Hlaup eða útivera' },
    ],
  },

  // --- HOBBY STAÐIR ---
  {
    id: 'gym',
    name: 'Líkamsræktarstöð',
    type: 'gym',
    icon: '🏋️',
    description: 'Þjálfun líkama og hugsunar',
    position: { x: 5, y: 3 },
    linkedLocationIds: ['park', 'hospital', 'social_club'],
    actions: [
      { type: 'exercise', label: 'Þjálfa', timeCost: 1, moneyCost: 200, description: '+líðan, -streita, +heilsa' },
      { type: 'practice_hobby', label: 'Æfa íþrótt', timeCost: 1, description: 'Æfa hobby "líkamsrækt"' },
    ],
  },
  {
    id: 'music_studio',
    name: 'Tónlistarstúdíó',
    type: 'social',
    icon: '🎸',
    description: 'Æfa tónlist og hljóðrita',
    position: { x: 6, y: 4 },
    linkedLocationIds: ['social_club', 'art_studio'],
    actions: [
      { type: 'practice_hobby', label: 'Æfa tónlist', timeCost: 1, description: '+xp í tónlist hobby' },
      { type: 'group_session', label: 'Hljómsveitar æfing', timeCost: 1, description: 'Æfa með hljómsveitar hóp' },
    ],
  },
  {
    id: 'art_studio',
    name: 'Listamannastúdíó',
    type: 'social',
    icon: '🎨',
    description: 'Vinna að list og sköpun',
    position: { x: 6, y: 3 },
    linkedLocationIds: ['music_studio', 'library'],
    actions: [
      { type: 'practice_hobby', label: 'Vinna að list', timeCost: 1, description: '+xp í list eða skrif hobby' },
      { type: 'group_session', label: 'Listahópur', timeCost: 1, description: 'Vinna með listahóp' },
    ],
  },
]

export function getLocationById(id: string): BoardLocation | undefined {
  return BOARD_LOCATIONS.find(l => l.id === id)
}

export const STARTING_LOCATION_ID = 'apartment_budget'

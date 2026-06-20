import type { Translations } from './types'

export const en: Translations = {
  lobby: {
    tagline: 'Life in the Fast Lane',
    players: 'Players',
    playerName: (n) => `Player ${n}`,
    addPlayer: '+ Add player',
    gameLength: 'Game length',
    short: 'Short',
    long: 'Long',
    jonesDifficulty: 'Jones difficulty',
    easy: 'Easy',
    mediumDiff: 'Medium',
    hard: 'Hard',
    goalCountLabel: 'Number of goals',
    goalsN: (n) => `${n} goals`,
    jonesCompetes: 'Jones competes against you',
    jonesCompetesDesc: 'AI rival from the original game',
    startGame: 'Start game →',
    language: 'Language',
  },

  goalSelection: {
    playerOf: (n, total) => `Player ${n} of ${total}`,
    chooseGoals: 'Choose your goals',
    selectGoalsDesc: (n) => `Pick ${n} goals — you must achieve all of them to win`,
    selectMore: (n) => `Pick ${n} more`,
    confirmNext: 'Confirm and next player →',
    startGame: 'Start game! →',
  },

  game: {
    week: 'Week',
    year: 'Year',
    myTurn: '⚡ Your turn',
    waitingFor: (name) => `⏳ Turn: ${name}`,
    aiThinking: 'Jones is thinking…',
    handoffTitle: 'Next up',
    handoffReady: "I'm ready →",
    endTurn: 'End week ↵',
    teLeft: (n) => `${n} TU left`,
    teUnit: 'TU',
    waitingForTurn: 'Waiting for your turn…',
    hobbies: 'Hobbies',
    noTime: 'Not enough time',
    noMoney: 'Not enough money',
    notEmployedHere: 'Not employed here',
    applyJobSubtitle: 'Opens job list',
    hobbyXpSubtitle: '+wellbeing, +XP',
    startVerb: 'Start',
    practiceVerb: 'Practice',
    jobNoReqs: (title) => `Requirements not met for ${title}`,
    jobHired: (title) => `🎉 Got a job as ${title}!`,
    hobbyXpMsg: (icon, name, xp) => `${icon} ${name} +${xp} XP`,
    work: 'Work',
    study: 'Study',
    rest: 'Rest',
    shop_food: 'Buy food',
    shop_clothes: 'Buy clothes',
    buy_meal: 'Buy a meal',
    socialize: 'Meet friends',
    exercise: 'Exercise',
    apply_job: 'Apply for job',
    practice_hobby: 'Practice hobby',
    form_group: 'Form a group',
    join_group: 'Join a group',
    group_session: 'Group session',
    upgrade_housing: 'Move to better place',
    quit: 'Quit',
    quitConfirmTitle: 'Quit the game?',
    quitConfirmBody: 'The current game will be lost and you will return to the start screen.',
    quitConfirm: 'Quit',
    quitCancel: 'Keep playing',
    standings: 'Standings',
  },

  standings: {
    title: 'Standings',
    you: 'You',
    leader: 'Leader',
    score: 'Score',
    points: 'pts',
    close: 'Close',
  },

  rules: {
    button: 'Rules',
    title: 'How to play',
    intro: 'Build a good life and collect the most points. Points come from completing your goals.',
    close: 'Close',
    sections: [
      {
        heading: '🎯 Goal of the game',
        body: [
          'You guide a young adult (starts at 22 with 5,000 kr.).',
          'Whoever has the most points when the game ends wins.',
        ],
      },
      {
        heading: '📅 Weeks and time',
        body: [
          'Each turn is one week. You get 10 time units per week.',
          'When time runs out (or you end the week) you get 10 fresh units next week.',
          'The game lasts 5, 10 or 20 years (52 weeks per year).',
        ],
      },
      {
        heading: '🏆 Goals and points',
        body: [
          'At the start you choose goals (3 by default).',
          'Each goal is worth points based on difficulty (10–35 pts).',
          'Final score = the sum of points for completed goals.',
        ],
      },
      {
        heading: '📊 Stats',
        body: [
          '💰 Wealth · 🎓 Knowledge · 💼 Career · ❤️ Wellbeing · 🤝 Network · ⭐ Reputation.',
          'Actions change these values and goals require certain minimums.',
        ],
      },
      {
        heading: '🏠 Actions',
        body: [
          'Click a building and pick an action: work, study, practice a hobby, socialize, rest, exercise, shop, upgrade housing, and more.',
          'You can only work where you are employed — apply for a job first.',
          'Most actions cost time, some also cost money.',
        ],
      },
      {
        heading: '🎲 Events',
        body: [
          'Random events occasionally fire and affect your stats or money.',
          'In single player, Jones (AI) competes against you.',
        ],
      },
    ],
  },

  news: {
    title: 'The Town Times',
    edition: (week, year) => `Week ${week} · Year ${year}`,
    close: 'Close',
    headlines: [
      'City council announces new public parks.',
      'Forecast: sunshine all week long.',
      'A new café opens downtown.',
      'Employers are hiring skilled workers.',
      'Housing prices keep climbing in town.',
      'The university adds new courses this fall.',
      'A weekend music festival draws big crowds.',
      'The gym unveils brand-new equipment.',
      'Experts say inflation is slowing down.',
      'Volunteers clean up the beach.',
      'A local startup secures fresh funding.',
      'Residents urged to save energy.',
    ],
  },

  gameOver: {
    wonTitle: (name) => `${name} wins!`,
    scoreAndYear: (score, year) => `${score} pts · Year ${year}`,
    playAgain: 'Play again',
    points: 'pts',
    money: 'kr.',
    ai: 'AI',
  },

  hud: {
    money: 'Money',
    stress: 'Stress',
    luck: 'Luck',
    noJob: 'Unemployed',
    timeUnits: 'Time units',
    goals: (done, total) => `${done}/${total} goals`,
    yourTurn: 'Your turn',
    rent: 'Rent',
    perWeek: 'kr/week',
  },

  housing: {
    budget: 'Budget apartment',
    mid: 'Mid-range apartment',
    luxury: 'Luxury apartment',
  },

  aiRecap: {
    title: (name: string) => `What did ${name} do?`,
    subtitle: (week: number) => `Week ${week}`,
    atLocation: (action: string, location: string) => `${action} — ${location}`,
    nothing: 'Did nothing this week.',
    close: 'Close',
  },

  jobPicker: {
    title: 'Available jobs',
    tier: 'Tier',
    currentJob: '✓ Current job',
    cancel: 'Cancel',
    perWeek: 'kr/wk',
    workplace: 'Workplace',
  },

  mealPicker: {
    title: 'Menu',
    cancel: 'Cancel',
  },

  dishes: {
    mcd_burger: { name: 'Burger', description: 'A classic hamburger' },
    mcd_fries: { name: 'Fries', description: 'Crispy french fries' },
    mcd_combo: { name: 'BigMac meal', description: 'Burger, fries and a drink' },
    mcd_shake: { name: 'Milkshake', description: 'A cold and sweet shake' },
    res_pasta: { name: 'Pasta', description: 'Homemade pasta of the day' },
    res_sushi: { name: 'Sushi', description: 'A fresh sushi selection' },
    res_steak: { name: 'Steak', description: 'Tender steak with sides' },
    res_course: { name: 'Three-course meal', description: 'Starter, main and dessert' },
  },

  eventDialog: {
    requires: 'Requires',
  },

  stats: {
    wealth: 'Wealth',
    knowledge: 'Knowledge',
    career: 'Career',
    wellbeing: 'Wellbeing',
    network: 'Network',
    reputation: 'Reputation',
    stress: 'Stress',
    luck: 'Luck',
  },

  hobbyLevels: {
    beginner: 'beginner',
    skilled: 'skilled',
    talented: 'talented',
    professional: 'professional',
  },

  goals: {
    millionaire: {
      name: 'Millionaire',
      description: 'Save 100,000 kr. and reach high wealth',
      hint: 'Get a high-paying job and invest wisely',
    },
    expert: {
      name: 'Expert',
      description: 'Reach high knowledge and a developed career',
      hint: 'Study and work in related fields',
    },
    wellbeing: {
      name: 'Happiness',
      description: 'Live well with low stress',
      hint: "Don't overwork — enjoy hobbies and rest",
    },
    celebrity: {
      name: 'Celebrity',
      description: 'Become a well-known person in the city',
      hint: 'Hobbies, career, and connections all help',
    },
    connector: {
      name: 'Networker',
      description: 'Build an extensive network',
      hint: 'Social life and group activities',
    },
    artist: {
      name: 'Artist',
      description: 'Reach professional level in a hobby',
      hint: 'Practice regularly over a long time',
    },
    executive: {
      name: 'Executive',
      description: 'Reach the highest career tier',
      hint: 'Education and experience are the key',
    },
    balanced: {
      name: 'Balance',
      description: 'Reach minimum score in all core stats',
      hint: 'Everything at once — hard but possible',
    },
    entrepreneur_goal: {
      name: 'Entrepreneur',
      description: 'Start a business and succeed',
      hint: 'Requires a strong network and good career',
    },
    zen: {
      name: 'Inner Peace',
      description: 'Reach maximum wellbeing',
      hint: 'Rest, hobbies, and minimal stress',
    },
  },

  events: {
    car_breakdown: {
      title: 'Car Breakdown',
      description: 'Your car breaks down on the way to work. An expensive repair awaits.',
      choices: {
        repair: { label: 'Get it repaired', description: 'Pay for the repair' },
        cheap_repair: { label: 'Cheap fix', description: 'A repair that will not last long' },
        sell_car: { label: 'Sell the car', description: 'Sell it and use public transport' },
      },
    },
    unexpected_bill: {
      title: 'Unexpected Bill',
      description: 'Unexpected expenses arise — dentist, appliance, or something else.',
      choices: {
        pay: { label: 'Pay it', description: 'Deal with it now' },
        delay: { label: 'Delay payment', description: 'Postpone — will cost more later' },
      },
    },
    job_offer: {
      title: 'Job Offer',
      description: 'Someone in your network gets in touch with a job offer.',
      choices: {
        accept: { label: 'Accept the offer', description: 'Switch jobs' },
        decline: { label: 'Decline', description: 'Stay where you are' },
      },
    },
    illness: {
      title: 'Illness',
      description: 'You fall ill and cannot work for several weeks.',
      choices: {
        rest: { label: 'Rest properly', description: 'Take time to recover' },
        push_through: { label: 'Push through', description: 'Try to keep going' },
      },
    },
    windfall: {
      title: 'Unexpected Inheritance',
      description: 'A distant relative leaves you an inheritance.',
      choices: {
        invest: { label: 'Invest', description: 'Use the money to invest' },
        spend: { label: 'Spend on daily life', description: 'Improve quality of life' },
      },
    },
    promotion_chance: {
      title: 'Promotion Opportunity',
      description: 'Your boss gives you a chance to prove yourself.',
      choices: {
        accept_challenge: { label: 'Take the challenge', description: 'Take on extra work' },
        decline_challenge: { label: 'Decline', description: 'Maintain balance' },
      },
    },
    burnout: {
      title: 'Exhaustion and Burnout',
      description: 'Stress has built up. You are suffering from burnout.',
      choices: {
        take_leave: { label: 'Take leave', description: 'Take time off to recover' },
        push_harder: { label: 'Push harder', description: 'Try to fight the fatigue' },
      },
    },
    networking_event: {
      title: 'Networking Event',
      description: 'You are invited to an industry networking event.',
      choices: {
        attend: { label: 'Attend', description: 'Go and introduce yourself' },
        skip: { label: 'Skip', description: 'Stay home' },
      },
    },
  },

  hobbies: {
    music: { name: 'Music', description: 'Learn an instrument and compose music' },
    programming: { name: 'Programming', description: 'Learn coding and build your own projects' },
    art: { name: 'Visual Art', description: 'Painting, drawing and other visual arts' },
    fitness: { name: 'Fitness', description: 'Physical training and wellness' },
    writing: { name: 'Writing', description: 'Write stories, articles or a blog' },
    cooking: { name: 'Cooking', description: 'Cook and develop recipes' },
  },

  jobs: {
    cashier: { title: 'Cashier', description: 'Work in a shop' },
    waiter: { title: 'Waiter', description: 'Serve at a restaurant' },
    fast_food: { title: 'Fast-food crew', description: 'Counter and kitchen at a fast-food joint' },
    chef: { title: 'Chef', description: 'Head cook at a fine restaurant' },
    manual_labor: { title: 'Manual Labour', description: 'Hard physical work' },
    office_worker: { title: 'Office Worker', description: 'General office work' },
    nurse: { title: 'Nurse', description: 'Nursing patients in hospital' },
    teacher: { title: 'Teacher', description: 'Teach students' },
    programmer: { title: 'Programmer', description: 'Build software' },
    accountant: { title: 'Accountant', description: 'Manage company finances' },
    designer: { title: 'Designer', description: 'Design and creative work' },
    senior_developer: { title: 'Senior Developer', description: 'Lead a development team' },
    doctor: { title: 'Doctor', description: 'Treat patients' },
    manager: { title: 'Manager', description: 'Run a department or company' },
    cto: { title: 'CTO', description: 'Chief Technology Officer' },
    entrepreneur: { title: 'Entrepreneur', description: 'Run your own business — high risk, big upside' },
  },

  locations: {
    employment_office: 'Employment Office',
    tech_company: 'Tech Company',
    hospital: 'Hospital',
    office_building: "McDonald's",
    retail_store: 'Retail Store',
    school: 'Restaurant',
    university: 'University',
    library: 'Library',
    online_courses: 'Online Courses',
    apartment_budget: 'Budget Flat',
    apartment_mid: 'Mid-range Flat',
    apartment_luxury: 'Luxury Flat',
    market: 'Market',
    clothing_store: 'Clothing Store',
    social_club: 'Social Club',
    park: 'The Park',
    gym: 'Gym',
    music_studio: 'Music Studio',
    art_studio: 'Art Studio',
  },
}

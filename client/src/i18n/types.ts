export interface Translations {
  lobby: {
    tagline: string
    players: string
    playerName: (n: number) => string
    addPlayer: string
    gameLength: string
    short: string
    long: string
    jonesDifficulty: string
    easy: string
    mediumDiff: string
    hard: string
    goalCountLabel: string
    goalsN: (n: number) => string
    jonesCompetes: string
    jonesCompetesDesc: string
    startGame: string
    language: string
  }

  goalSelection: {
    playerOf: (n: number, total: number) => string
    chooseGoals: string
    selectGoalsDesc: (n: number) => string
    selectMore: (n: number) => string
    confirmNext: string
    startGame: string
  }

  game: {
    week: string
    year: string
    myTurn: string
    waitingFor: (name: string) => string
    aiThinking: string
    handoffTitle: string
    handoffReady: string
    endTurn: string
    teLeft: (n: number) => string
    teUnit: string
    waitingForTurn: string
    hobbies: string
    noTime: string
    noMoney: string
    notEmployedHere: string
    applyJobSubtitle: string
    hobbyXpSubtitle: string
    startVerb: string
    practiceVerb: string
    jobNoReqs: (title: string) => string
    jobHired: (title: string) => string
    hobbyXpMsg: (icon: string, name: string, xp: number) => string
    work: string
    study: string
    rest: string
    shop_food: string
    shop_clothes: string
    buy_meal: string
    socialize: string
    exercise: string
    apply_job: string
    practice_hobby: string
    form_group: string
    join_group: string
    group_session: string
    upgrade_housing: string
    quit: string
    quitConfirmTitle: string
    quitConfirmBody: string
    quitConfirm: string
    quitCancel: string
    standings: string
  }

  standings: {
    title: string
    you: string
    leader: string
    score: string
    points: string
    close: string
  }

  // Localized outcome messages for engine ActionResult `code` values.
  actionMsg: {
    notYourTurn: string
    locationNotFound: string
    actionUnavailable: string
    notEnoughTime: string
    notEnoughMoney: string
    notWorking: string
    workplaceNotFound: string
    hobbyNotFound: string
    dishNotFound: string
    unknownAction: string
    socialized: string
    rested: string
    exercised: string
    boughtClothes: string
    boughtFood: string
    upgradedHousing: string
    groupSession: string
    formedGroup: string
    joinedGroup: string
    worked: (title: string) => string
    studied: (amount: number) => string
    practiced: (name: string) => string
    boughtMeal: (name: string) => string
    error: string
  }

  rules: {
    button: string
    title: string
    intro: string
    close: string
    sections: Array<{ heading: string; body: string[] }>
  }

  news: {
    title: string
    edition: (week: number, year: number) => string
    close: string
    headlines: string[]
  }

  gameOver: {
    wonTitle: (name: string) => string
    scoreAndYear: (score: number, year: number) => string
    playAgain: string
    points: string
    money: string
    ai: string
  }

  hud: {
    money: string
    stress: string
    luck: string
    noJob: string
    timeUnits: string
    goals: (done: number, total: number) => string
    yourTurn: string
    rent: string
    perWeek: string
  }

  housing: Record<string, string>

  aiRecap: {
    title: (name: string) => string
    subtitle: (week: number) => string
    atLocation: (action: string, location: string) => string
    nothing: string
    close: string
  }

  jobPicker: {
    title: string
    tier: string
    currentJob: string
    cancel: string
    perWeek: string
    workplace: string
  }

  mealPicker: {
    title: string
    cancel: string
  }

  dishes: Record<string, { name: string; description: string }>

  eventDialog: {
    requires: string
  }

  stats: {
    wealth: string
    knowledge: string
    career: string
    wellbeing: string
    network: string
    reputation: string
    stress: string
    luck: string
  }

  hobbyLevels: {
    beginner: string
    skilled: string
    talented: string
    professional: string
  }

  goals: Record<string, { name: string; description: string; hint: string }>
  events: Record<string, {
    title: string
    description: string
    choices: Record<string, { label: string; description: string }>
  }>
  hobbies: Record<string, { name: string; description: string }>
  jobs: Record<string, { title: string; description: string }>
  locations: Record<string, string>
}

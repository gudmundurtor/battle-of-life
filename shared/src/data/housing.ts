export type HousingTier = 'budget' | 'mid' | 'luxury'

export interface HousingDef {
  tier: HousingTier
  locationId: string
  name: string
  /** Rent charged every week (per player turn). */
  weeklyRent: number
  /** Cost to move into this tier from the previous one (null = starting tier). */
  upgradeCost: number | null
}

export const HOUSING: Record<HousingTier, HousingDef> = {
  budget: {
    tier: 'budget',
    locationId: 'apartment_budget',
    name: 'Ódýr íbúð',
    weeklyRent: 500,
    upgradeCost: null,
  },
  mid: {
    tier: 'mid',
    locationId: 'apartment_mid',
    name: 'Meðal íbúð',
    weeklyRent: 1500,
    upgradeCost: 5000,
  },
  luxury: {
    tier: 'luxury',
    locationId: 'apartment_luxury',
    name: 'Lúxus íbúð',
    weeklyRent: 4000,
    upgradeCost: 20000,
  },
}

/** Map an apartment location id to its housing tier. */
export const HOUSING_TIER_BY_LOCATION: Record<string, HousingTier> = {
  apartment_budget: 'budget',
  apartment_mid: 'mid',
  apartment_luxury: 'luxury',
}

/** The tier you move into when you upgrade from a given apartment location. */
const UPGRADE_TARGET_BY_LOCATION: Record<string, HousingTier> = {
  apartment_budget: 'mid',
  apartment_mid: 'luxury',
}

const TIER_ORDER: HousingTier[] = ['budget', 'mid', 'luxury']

export function getHousing(tier: HousingTier): HousingDef {
  return HOUSING[tier]
}

/** The board location id of the apartment a player currently rents. */
export function getHousingLocationId(tier: HousingTier): string {
  return HOUSING[tier].locationId
}

export function getWeeklyRent(tier: HousingTier): number {
  return HOUSING[tier].weeklyRent
}

/** Tier reached by performing upgrade_housing at the given location, or null. */
export function getUpgradeTargetTier(locationId: string): HousingTier | null {
  return UPGRADE_TARGET_BY_LOCATION[locationId] ?? null
}

/** The tier one step cheaper, or null if already at the cheapest. */
export function getDowngradeTier(tier: HousingTier): HousingTier | null {
  const idx = TIER_ORDER.indexOf(tier)
  return idx > 0 ? TIER_ORDER[idx - 1] : null
}

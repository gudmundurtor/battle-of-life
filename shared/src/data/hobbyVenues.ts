/**
 * Where each hobby can logically be practiced.
 *
 * Rule: a hobby is practiceable at its dedicated venue(s) OR at the player's
 * home. Hobbies with no venue (e.g. cooking) are home-only. Owned hobbies can
 * always be kept up at home regardless of venue.
 */
export const HOBBY_VENUES: Record<string, string[]> = {
  music: ['music_studio'],
  art: ['art_studio'],
  writing: ['library'],
  fitness: ['gym', 'park'],
  programming: ['online_courses'],
  cooking: [], // home only
}

/** Hobbies that can be started/practiced at home even before being owned. */
export const HOME_HOBBY_IDS: string[] = ['cooking']

/** Reverse lookup: the hobby whose venue is this location, if any. */
export function getVenueHobbyId(locationId: string): string | undefined {
  for (const [hobbyId, locations] of Object.entries(HOBBY_VENUES)) {
    if (locations.includes(locationId)) return hobbyId
  }
  return undefined
}

import type { StatEffect } from './stats.js'

export interface MenuItem {
  id: string
  /** Board location (venue) where this dish can be bought. */
  locationId: string
  name: string
  icon: string
  price: number
  effects: StatEffect[]
  description: string
}

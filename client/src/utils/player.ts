export const PLAYER_AVATARS = ['🧑', '👩', '🧔', '👧']

export function getPlayerAvatar(playerId: string): string {
  if (playerId === 'jones') return '🤖'
  const idx = parseInt(playerId.replace('player_', '')) || 0
  return PLAYER_AVATARS[idx % PLAYER_AVATARS.length]
}

export const ACTION_ICONS: Record<string, string> = {
  work: '💼',
  study: '📖',
  rest: '😴',
  shop_food: '🛒',
  shop_clothes: '👔',
  buy_meal: '🍽️',
  socialize: '🤝',
  exercise: '💪',
  apply_job: '📋',
  practice_hobby: '⭐',
  form_group: '👥',
  join_group: '👥',
  group_session: '🎸',
  upgrade_housing: '🏡',
}

export const ACTION_COLORS: Record<string, string> = {
  work: '#3B82F6',
  study: '#F59E0B',
  rest: '#10B981',
  shop_food: '#EC4899',
  shop_clothes: '#8B5CF6',
  buy_meal: '#F59E0B',
  socialize: '#F97316',
  exercise: '#EF4444',
  apply_job: '#7C3AED',
  practice_hobby: '#14B8A6',
  form_group: '#06B6D4',
  join_group: '#06B6D4',
  group_session: '#14B8A6',
  upgrade_housing: '#22C55E',
}

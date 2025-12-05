let currentUserId: string | null = null

export const setCurrentUserId = (userId: string | null) => {
  currentUserId = userId
}

export const getCurrentUserId = (): string | null => {
  return currentUserId
}

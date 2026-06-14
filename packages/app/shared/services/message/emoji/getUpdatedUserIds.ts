// Toggle the user in the id list: add if absent, remove if already present.
export const getUpdatedUserIds = (userIds: string[], newUserId: string) =>
  userIds.includes(newUserId) ? userIds.filter((id) => id !== newUserId) : [...userIds, newUserId];

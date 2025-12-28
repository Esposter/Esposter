// An update is:
// 1. Adding the user to the id list if the user doesn't exist
// 2. Removing the user from the id list if the user exists for the already existing emoji
export const getUpdatedUserIds = (userIds: string[], newUserId: string) =>
  userIds.includes(newUserId) ? userIds.filter((id) => id !== newUserId) : [...userIds, newUserId];

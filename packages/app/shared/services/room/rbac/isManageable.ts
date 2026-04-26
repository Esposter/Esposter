export const isManageable = (actorTopPosition: number, targetPosition: number, isRoomOwner: boolean): boolean => {
  if (isRoomOwner) return true;
  return actorTopPosition > targetPosition;
};

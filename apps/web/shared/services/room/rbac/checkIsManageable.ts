export const checkIsManageable = (actorTopPosition: number, targetPosition: number, isRoomOwner: boolean): boolean => {
  if (isRoomOwner) return true;
  else return actorTopPosition > targetPosition;
};

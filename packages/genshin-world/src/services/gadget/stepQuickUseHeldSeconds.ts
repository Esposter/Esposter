// The seconds Z has been held after a frame of `seconds`: the seconds before it plus the frame while Z is held, and none
// Once it is released
export const stepQuickUseHeldSeconds = (heldSeconds: number, isHeld: boolean, seconds: number): number =>
  isHeld ? heldSeconds + seconds : 0;

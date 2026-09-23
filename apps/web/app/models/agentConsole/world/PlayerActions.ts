// What the player is asked to do this frame beside walking: jump while held, as Minecraft repeats a held jump on each
// Landing, sneak while held, and sprint once started until forward is let go
export interface PlayerActions {
  isJumping: boolean;
  isSneaking: boolean;
  isSprinting: boolean;
}

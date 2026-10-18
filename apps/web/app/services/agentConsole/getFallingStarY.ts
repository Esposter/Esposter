import {
  FALLING_STAR_DURATION_SECONDS,
  FALLING_STAR_LAND_Y,
  FALLING_STAR_START_Y,
} from "@/services/agentConsole/constants";

// The star's height in the view after elapsed seconds: it starts above the view and gathers speed as it falls, so the
// Drop reads as a fall rather than a slide, and holds where it landed once the fall is over
export const getFallingStarY = (elapsedSeconds: number): number => {
  const progress = Math.min(elapsedSeconds / FALLING_STAR_DURATION_SECONDS, 1);
  return FALLING_STAR_START_Y + (FALLING_STAR_LAND_Y - FALLING_STAR_START_Y) * progress * progress;
};

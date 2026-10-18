import { COOKING_POINTER_SWEEP_SECONDS } from "#src/services/cooking/constants";

// Where the indicator's pointer stands along its bar as a fraction, `elapsedSeconds` after the cooking screen opens: it
// Swings from the left end to the right and back, a sweep taking `COOKING_POINTER_SWEEP_SECONDS` each way, and stands at the left
// End before the screen opens
export const getCookingPointerPosition = (elapsedSeconds: number): number => {
  if (elapsedSeconds <= 0) return 0;
  const phase = (elapsedSeconds / COOKING_POINTER_SWEEP_SECONDS) % 2;
  return phase <= 1 ? phase : 2 - phase;
};

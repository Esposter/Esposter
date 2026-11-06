import { SCRIPTED_FRAME_LIMIT } from "#src/services/dev/constants";

// Steps frames until `check` gives a value, reading it before each frame so a check that already holds steps none, and
// Returns that value. The first `minFrames` frames step before the check is first read, so a change has applied before
// Anything is read. Undefined once SCRIPTED_FRAME_LIMIT frames have passed without one, counting those first frames too:
// The bound every scripted wait shares, so each caller names its own failure
export const stepFramesUntil = async <T>(
  frame: () => Promise<void>,
  check: () => T | undefined,
  minFrames = 0,
): Promise<T | undefined> => {
  let frames = 0;
  while (frames < minFrames) {
    // oxlint-disable-next-line no-await-in-loop -- Order is the contract: each frame lands before the next steps
    await frame();
    frames += 1;
  }

  let result = check();
  while (result === undefined) {
    if (frames === SCRIPTED_FRAME_LIMIT) return undefined;

    // oxlint-disable-next-line no-await-in-loop -- Each step reads the last: the check reads what the frame just drew
    await frame();
    frames += 1;
    result = check();
  }

  return result;
};

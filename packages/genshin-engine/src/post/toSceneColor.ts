import { toneMapNeutral } from "#src/post/toneMapNeutral";
import { Color } from "three";

// The inverse is found by Newton steps on each channel, its slope measured a small nudge away: the channels barely
// Pull on one another, so a handful of steps meet the measured colour well within the display's precision
const INVERSE_STEP_COUNT = 16;
const SLOPE_NUDGE = 1e-4;
// The tone mapping only nears white, so a measured white has no scene colour: each channel stops here, which it shows
// Within a step of the display's precision of white
const SCENE_CHANNEL_LIMIT = 1.5;

// The scene colour the renderer's tone mapping shows as a colour measured off a reference, for a colour the screen
// Shows as it is (the sky, its haze, an unlit cloud): fed in unmapped, a measured colour comes out paler and greyer by
// The tone mapping's compression
export const toSceneColor = (displayColor: Color): Color => {
  const target: [number, number, number] = [displayColor.r, displayColor.g, displayColor.b];
  let input: [number, number, number] = [...target];
  for (let step = 0; step < INVERSE_STEP_COUNT; step++) {
    const output = toneMapNeutral(input);
    input = input.map((channel, index) => {
      const nudged: [number, number, number] = [...input];
      nudged[index] = channel + SLOPE_NUDGE;
      const slope = ((toneMapNeutral(nudged)[index] ?? 0) - (output[index] ?? 0)) / SLOPE_NUDGE;
      return Math.min(
        Math.max(channel + ((target[index] ?? 0) - (output[index] ?? 0)) / slope, 0),
        SCENE_CHANNEL_LIMIT,
      );
    }) as [number, number, number];
  }
  return new Color(...input);
};

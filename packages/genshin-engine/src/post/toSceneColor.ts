import { toneMapNeutral } from "#src/post/toneMapNeutral";
import { Color } from "three";

// The inverse is found by Newton steps on each channel, its slope measured a small nudge away: the channels barely
// Pull on one another, so a handful of steps meet the measured colour well within the display's precision
const INVERSE_STEP_COUNT = 16;
const SLOPE_NUDGE = 1e-4;
// The tone mapping only nears white, so a measured white has no scene colour: each channel stops here, which it shows
// Within a step of the display's precision of white
const SCENE_CHANNEL_LIMIT = 1.5;
// The solve's working colours, kept between calls since the sky solves a dozen a frame
const target: [number, number, number] = [0, 0, 0];
const input: [number, number, number] = [0, 0, 0];
const output: [number, number, number] = [0, 0, 0];
const nudged: [number, number, number] = [0, 0, 0];
const nudgedOutput: [number, number, number] = [0, 0, 0];
const stepped: [number, number, number] = [0, 0, 0];
// The scene colour the renderer's tone mapping shows as a colour measured off a reference, for a colour the screen
// Shows as it is (the sky, its haze, an unlit cloud): fed in unmapped, a measured colour comes out paler and greyer by
// The tone mapping's compression. Written into the colour given, which may be the measured colour itself
export const toSceneColor = (displayColor: Color, sceneColor: Color = new Color()): Color => {
  target[0] = input[0] = displayColor.r;
  target[1] = input[1] = displayColor.g;
  target[2] = input[2] = displayColor.b;
  for (let step = 0; step < INVERSE_STEP_COUNT; step++) {
    toneMapNeutral(input, output);
    for (let index = 0; index < 3; index++) {
      nudged[0] = input[0];
      nudged[1] = input[1];
      nudged[2] = input[2];
      const channel = input[index] ?? 0;
      nudged[index] = channel + SLOPE_NUDGE;
      toneMapNeutral(nudged, nudgedOutput);
      const slope = ((nudgedOutput[index] ?? 0) - (output[index] ?? 0)) / SLOPE_NUDGE;
      stepped[index] = Math.min(
        Math.max(channel + ((target[index] ?? 0) - (output[index] ?? 0)) / slope, 0),
        SCENE_CHANNEL_LIMIT,
      );
    }
    input[0] = stepped[0];
    input[1] = stepped[1];
    input[2] = stepped[2];
  }
  return sceneColor.setRGB(input[0], input[1], input[2]);
};

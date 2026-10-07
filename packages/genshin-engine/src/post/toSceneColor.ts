import {
  GENSHIN_TONE_CONTRAST,
  GENSHIN_TONE_EXPOSURE,
  TONE_CONTRAST_OFFSET,
  TONE_CURVE_LIFT,
} from "#src/renderer/constants";
import { Color } from "three";

// One channel taken back through the tone curve (`toneMapGenshin`), held between the curve's floor
// (`TONE_CURVE_FLOOR`), which a channel darker than the curve's black at none comes back under none toward, and the
// Brightest scene colour the curve's lift lets it tell from white
const toSceneChannel = (channel: number): number =>
  -Math.log2(
    1 + TONE_CURVE_LIFT - Math.min(Math.max(channel, 0), 1) ** (1 / (GENSHIN_TONE_CONTRAST + TONE_CONTRAST_OFFSET)),
  ) / GENSHIN_TONE_EXPOSURE;
// The scene colour the renderer's tone curve shows as a colour measured off a reference, for a colour the screen shows
// As it is (the sky, its haze, an unlit cloud): fed in unmapped, a measured colour comes out paler and greyer by the
// Curve's compression. Each channel is the curve's closed inverse. Written into the colour given, which may be the
// Measured colour itself
export const toSceneColor = (displayColor: Color, sceneColor: Color = new Color()): Color =>
  sceneColor.setRGB(toSceneChannel(displayColor.r), toSceneChannel(displayColor.g), toSceneChannel(displayColor.b));

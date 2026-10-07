import {
  GENSHIN_TONE_CONTRAST,
  GENSHIN_TONE_EXPOSURE,
  TONE_CONTRAST_OFFSET,
  TONE_CURVE_LIFT,
} from "#src/renderer/constants";

// A scene colour in linear channels as the renderer's tone curve shows it, before the display's encoding, each channel
// On its own (`GENSHIN_TONE_MAPPING`). Written into the tuple given, so a caller that runs it every frame allocates
// Nothing
export const toneMapGenshin = (
  sceneColor: readonly [number, number, number],
  toneMapped: [number, number, number] = [0, 0, 0],
): [number, number, number] => {
  for (let index = 0; index < 3; index++)
    toneMapped[index] = Math.min(
      (1 + TONE_CURVE_LIFT - 2 ** (-GENSHIN_TONE_EXPOSURE * Math.max(sceneColor[index] ?? 0, 0))) **
        (GENSHIN_TONE_CONTRAST + TONE_CONTRAST_OFFSET),
      1,
    );
  return toneMapped;
};

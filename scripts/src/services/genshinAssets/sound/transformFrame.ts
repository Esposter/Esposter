import { SOUND_EFFECT_FRAME_LENGTH, transformFourier } from "genshin-engine";

const window = Float64Array.from(
  { length: SOUND_EFFECT_FRAME_LENGTH },
  (_value, index) => 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / SOUND_EFFECT_FRAME_LENGTH),
);
// One channel's spectrum in one frame, its window centred on the frame by leading the sound with half a window
export const transformFrame = (samples: Float32Array, start: number): [Float64Array, Float64Array] => {
  const real = new Float64Array(SOUND_EFFECT_FRAME_LENGTH);
  const imaginary = new Float64Array(SOUND_EFFECT_FRAME_LENGTH);
  for (let index = 0; index < SOUND_EFFECT_FRAME_LENGTH; index++)
    real[index] = (samples[start + index] ?? 0) * (window[index] ?? 0);
  transformFourier(real, imaginary);
  return [real, imaginary];
};

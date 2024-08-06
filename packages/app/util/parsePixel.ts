// @TODO: Remove this in next phaser release
// https://github.com/phaserjs/phaser/issues/6863
export const parsePixel = (pixel: number | string) =>
  typeof pixel === "number" ? pixel : Number(pixel.replace(/px$/, ""));

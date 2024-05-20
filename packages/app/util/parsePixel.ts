export const parsePixel = (pixel: number | string) =>
  typeof pixel === "number" ? pixel : Number(pixel.replace(/px$/, ""));

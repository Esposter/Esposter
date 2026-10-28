import { MathUtils } from "three";

// A traced shade over a part's stone as the fill a canvas draws it with: each channel at half, since a canvas holds no
// More than 1 a channel and a shade may stand lighter than the stone, so what reads the canvas doubles it. The stone
// Itself is the shade of 1 a channel
export const getHalfShadeStyle = (shade: readonly number[]): string => {
  const [red = 1, green = 1, blue = 1] = shade.map((channel) => MathUtils.clamp(channel / 2, 0, 1) * 100);
  return `rgb(${red}% ${green}% ${blue}%)`;
};

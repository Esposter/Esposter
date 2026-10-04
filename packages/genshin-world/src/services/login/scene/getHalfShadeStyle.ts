import { MathUtils } from "three";

// A traced shade over a part's stone as the fill a canvas draws it with: each channel its contrast's share as far from
// The stone's 1 as traced, at half, since a canvas holds no more than 1 a channel and a shade may stand lighter than
// The stone, so what reads the canvas doubles it. The stone itself is the shade of 1 a channel
export const getHalfShadeStyle = (shade: readonly number[], contrast: number): string => {
  const [red = 1, green = 1, blue = 1] = shade.map(
    (channel) => MathUtils.clamp((1 + contrast * (channel - 1)) / 2, 0, 1) * 100,
  );
  return `rgb(${red}% ${green}% ${blue}%)`;
};

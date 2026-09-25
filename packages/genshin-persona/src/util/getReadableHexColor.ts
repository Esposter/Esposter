import { MAX_COLOR_CHANNEL_VALUE } from "#src/services/constants";
import { getContrastRatio } from "#src/util/getContrastRatio";
import { getHexColor } from "#src/util/getHexColor";
import { getLinearChannels } from "#src/util/getLinearChannels";

const WCAG_AA_CONTRAST_RATIO = 4.5;
// How far OKLab's lightness, from 0 to 1, rises between two tries: small enough that a nudged colour lands just past
// The threshold rather than well beyond it
const LIGHTNESS_STEP = 0.005;
// The sRGB transfer function applied again, and Björn Ottosson's OKLab matrices, from
// https://bottosson.github.io/posts/oklab
const fromLinear = (value: number) => {
  const clamped = Math.min(Math.max(value, 0), 1);
  return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
};
const toOklab = (hexColor: string): [number, number, number] => {
  const [red = 0, green = 0, blue = 0] = getLinearChannels(hexColor);
  const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  return [
    0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short,
    1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short,
    0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short,
  ];
};
const fromOklab = (lightness: number, a: number, b: number): string => {
  const long = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return getHexColor(
    [
      4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
      -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
      -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
    ].map((channel) => fromLinear(channel) * MAX_COLOR_CHANNEL_VALUE),
  );
};
// The colour itself where it already meets WCAG AA on the background, and otherwise the colour lightened in OKLab
// Until it does: the hue and the chroma kept, so a deep red stays a red rather than washing out to the pink a mix
// With white would. Lightness at its top is white, which meets AA on any background dark enough to need this
export const getReadableHexColor = (hexColor: string, backgroundHexColor: string): string => {
  const [lightness, a, b] = toOklab(hexColor);
  let nudgedLightness = lightness;
  let readableHexColor = hexColor;
  while (getContrastRatio(readableHexColor, backgroundHexColor) < WCAG_AA_CONTRAST_RATIO && nudgedLightness < 1) {
    nudgedLightness = Math.min(nudgedLightness + LIGHTNESS_STEP, 1);
    readableHexColor = fromOklab(nudgedLightness, a, b);
  }
  return readableHexColor;
};

import { blankCssComments } from "#src/services/sweeps/blankCssComments";

const CHANNEL_COUNT = 3;
const HEX_DIGITS_PER_CHANNEL = 2;

// The pattern a `#rrggbb` colour is written as, its hex literal in any case or its `rgb()` with the same three channels
// And no alpha, the channels set apart by spaces or commas. A literal with more digits, or an `rgb()` with an alpha, is
// Another colour and is not matched
const toColourRegex = (colour: string): RegExp => {
  const channels = Array.from({ length: CHANNEL_COUNT }, (_value, index) =>
    Number.parseInt(colour.slice(1 + index * HEX_DIGITS_PER_CHANNEL, 1 + (index + 1) * HEX_DIGITS_PER_CHANNEL), 16),
  );
  return new RegExp(`${colour}(?![\\da-f])|rgb\\(\\s*${channels.join("[\\s,]+")}\\s*\\)`, "iu");
};

// A colour the interface library already publishes as a constant, written again as its literal in a stylesheet, is a
// Second copy that drifts from the first: a `.vue` style block reads the constant with `v-bind(NAME)` instead. Each
// Restated literal is reported as `line: NAME`, comments left out, whatever its case and whether it is written in hex or
// As `rgb()`
export const getRestatedGameColours = (
  css: string,
  colourMap: Readonly<Record<string, string>>,
  firstLine = 1,
): string[] => {
  const colourRegexes = Object.entries(colourMap).map(([name, colour]) => [name, toColourRegex(colour)] as const);
  return blankCssComments(css)
    .split("\n")
    .flatMap((line, index) =>
      colourRegexes.filter(([, regex]) => regex.test(line)).map(([name]) => `${firstLine + index}: ${name}`),
    );
};

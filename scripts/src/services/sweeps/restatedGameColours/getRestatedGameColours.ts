const COMMENT_REGEX = /\/\*[\s\S]*?\*\//gu;

// A colour the interface library already publishes as a constant, written again as its literal in a stylesheet, is a
// Second copy that drifts from the first: a `.vue` style block reads the constant with `v-bind(NAME)` instead. Each
// Restated literal is reported as `line: NAME`, comments left out, and a literal is matched whatever its case
export const getRestatedGameColours = (
  css: string,
  colourMap: Readonly<Record<string, string>>,
  firstLine = 1,
): string[] =>
  css
    .replaceAll(COMMENT_REGEX, (comment) => comment.replaceAll(/[^\n]/gu, " "))
    .split("\n")
    .flatMap((line, index) =>
      Object.entries(colourMap)
        .filter(([, colour]) => line.toLowerCase().includes(colour.toLowerCase()))
        .map(([name]) => `${firstLine + index}: ${name}`),
    );

// A `test(` or `it(` call, with any modifier (`.only`, `.skip`, `.concurrent`), opening on a string literal title. A table
// Test (`test.each(rows)("title")`) opens on its rows and so is not read: its title is a template, not a scenario's.
const TEST_CALL_REGEX =
  /(?<![\w$.])(?:test|it)(?:\.[A-Za-z_$][\w$]*)*\s*\(\s*(?<quote>["'`])(?<title>(?:\\.|(?!\k<quote>)[^\\\n])*)\k<quote>/gu;

// The title of every test a source file registers by a string literal, escapes read
export const readTestTitles = (source: string): string[] =>
  Array.from(source.matchAll(TEST_CALL_REGEX), ({ groups }) =>
    (groups?.title ?? "").replaceAll(/\\(?<character>.)/gu, "$<character>"),
  );

import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("comments/no-capitalized-identifier", () => {
  const CAPITALISED = "AB";
  const IDENTIFIER = "aB";
  const PREFIXED = "GetA";
  const RULE = "comments/no-capitalized-identifier";
  const FIXTURES = [
    {
      name: "opensOnCapitalisedDeclaration",
      source: `// A\n// ${CAPITALISED} b\nexport const ${IDENTIFIER} = 0;`,
      violations: 1,
    },
    {
      name: "opensOnCapitalisedImport",
      source: `import { ${IDENTIFIER} } from "a";\n// A\n// ${CAPITALISED} b\n${IDENTIFIER}();`,
      violations: 1,
    },
    { name: "opensOnCapitalisedReference", source: `// A\n// ${CAPITALISED} b\n${IDENTIFIER}();`, violations: 1 },
    { name: "opensOnCapitalisedMember", source: `// A\n// ${CAPITALISED} b\na.${IDENTIFIER}();`, violations: 1 },
    { name: "opensOnCapitalisedSnakeCase", source: `// A\n// A_b c\nexport const a_b = 0;`, violations: 1 },
    // A function prefix and a capital spell a name wherever it is declared, at a sentence start as much as mid-sentence
    { name: "opensOnForeignPrefixedName", source: `// A\n// ${PREFIXED} b\nexport const b = 0;`, violations: 1 },
    { name: "opensSentenceOnPrefixedName", source: `// ${PREFIXED} b\nexport const b = 0;`, violations: 1 },
    { name: "opensOnPrefixedWord", source: `// A\n// Getting b\nexport const b = 0;`, violations: 0 },
    // A single lowercase word reads the same capitalised as the prose word it also is
    { name: "opensOnCapitalisedWord", source: `// A\n// Value b\nexport const value = 0;`, violations: 0 },
    // The capitalised spelling is itself a name in the file, so the comment may mean it
    {
      name: "opensOnPascalCaseName",
      source: `// A\n// ${CAPITALISED} b\nexport class ${CAPITALISED} {}\nexport const ${IDENTIFIER} = 0;`,
      violations: 0,
    },
    // A sentence start may open on a proper name the file binds camel-cased, as `PageBuilder` is imported `pageBuilder`
    {
      name: "opensSentenceOnName",
      source: `// A.\n// ${CAPITALISED} b\nexport const ${IDENTIFIER} = 0;`,
      violations: 0,
    },
    { name: "opensFirstLineOnName", source: `// ${CAPITALISED} b\nexport const ${IDENTIFIER} = 0;`, violations: 0 },
    {
      name: "opensAfterGapOnName",
      source: `// A\n\n// ${CAPITALISED} b\nexport const ${IDENTIFIER} = 0;`,
      violations: 0,
    },
    // A name the file never spells is the ledger grep's, since nothing in the file says it was ever lowercase
    { name: "opensOnForeignName", source: `// A\n// ${CAPITALISED} b\nexport const b = 0;`, violations: 0 },
    // A backtick is the spelling the linter leaves alone
    {
      name: "opensOnBacktickedName",
      source: `// A\n// \`${IDENTIFIER}\` b\nexport const ${IDENTIFIER} = 0;`,
      violations: 0,
    },
    { name: "namesMidLine", source: `// A ${IDENTIFIER} b\nexport const ${IDENTIFIER} = 0;`, violations: 0 },
    // A block comment is not capitalised, so whatever it opens on was written that way
    { name: "opensBlockOnName", source: `/* A\n ${CAPITALISED} b */\nexport const ${IDENTIFIER} = 0;`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "comments", rules: [RULE] });
});

describe("comments/require-directive-reason", () => {
  const FILE_DIRECTIVE = "eslint-disable";
  const LINE_DIRECTIVE = "oxlint-disable-line";
  const NEXT_LINE_DIRECTIVE = "oxlint-disable-next-line";
  const RULE = "comments/require-directive-reason";
  const FIXTURES = [
    {
      name: "nextLineWithoutReason",
      source: `// ${NEXT_LINE_DIRECTIVE} no-void
void 0;`,
      violations: 1,
    },
    {
      name: "fileWithoutReason",
      source: `/* ${FILE_DIRECTIVE} a/b */
export const a = 0;`,
      violations: 1,
    },
    { name: "sameLineWithoutReason", source: `void 0; // ${LINE_DIRECTIVE} no-void`, violations: 1 },
    // A bare directive switches this rule off with every other, so it is the one shape no rule of either linter sees
    {
      name: "bareFileDirective",
      source: `/* oxlint-disable */
export const a = 0;`,
      violations: 0,
    },
    // A separator with nothing after it states no reason
    {
      name: "emptyReason",
      source: `// ${NEXT_LINE_DIRECTIVE} no-void --
void 0;`,
      violations: 1,
    },
    {
      name: "nextLineWithReason",
      source: `// ${NEXT_LINE_DIRECTIVE} no-void -- a
void 0;`,
      violations: 0,
    },
    {
      name: "fileWithReason",
      source: `/* ${FILE_DIRECTIVE} a/b -- a */
export const a = 0;`,
      violations: 0,
    },
    // The reason may wrap onto the block comment's next line
    {
      name: "blockReasonWraps",
      source: `/* oxlint-disable a/b --
 a */
export const a = 0;`,
      violations: 0,
    },
    // Closing a range is not a directive that needs defending
    {
      name: "enableDirective",
      source: `/* eslint-enable a/b */
export const a = 0;`,
      violations: 0,
    },
    // Prose naming a directive mid-sentence is not one
    {
      name: "namesDirectiveMidLine",
      source: `// A carries an ${FILE_DIRECTIVE}
export const a = 0;`,
      violations: 0,
    },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "comments", rules: [RULE] });
});

describe("comments/no-trailing-comment", () => {
  const LINE_DIRECTIVE = "oxlint-disable-line";
  const RULE = "comments/no-trailing-comment";
  const FIXTURES = [
    { name: "trailsCode", source: `export const a = 0; // A`, violations: 1 },
    { name: "trailsOpeningBrace", source: `export const a = { // A\n  b: 0,\n};`, violations: 1 },
    { name: "ownLine", source: `// A\nexport const a = 0;`, violations: 0 },
    { name: "indentedOwnLine", source: `export const a = () => {\n  // A\n  return 0;\n};`, violations: 0 },
    // A block comment is not a `//` line — the `@vue-ignore` block a props interface needs inline is one
    { name: "trailingBlock", source: `export const a = 0; /* A */`, violations: 0 },
    // A same-line directive names the line it sits on
    {
      name: "sameLineDirective",
      source: `export const a = 0; // ${LINE_DIRECTIVE} no-magic-numbers -- A`,
      violations: 0,
    },
    // The formatter hangs a comment on a ternary branch after its operator
    {
      name: "ternaryBranch",
      source: `export const a = b
  ? // A
    0
  : // B
    1;`,
      violations: 0,
    },
    // A `//` inside a string is not a comment
    { name: "slashesInString", source: `export const a = "https://a";`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "comments", rules: [RULE] });
});

describe("comments/no-repeated-disable-next-line", () => {
  const ESLINT_DIRECTIVE = "eslint-disable-next-line";
  const OXLINT_DIRECTIVE = "oxlint-disable-next-line";
  const RULE = "comments/no-repeated-disable-next-line";
  const FIXTURES = [
    // The second occurrence is reported, and the fix collapses both into one file-level directive on the first line
    {
      fixed: `/* oxlint-disable no-void -- a; b */\nvoid 0;\nvoid 1;`,
      name: "twoOccurrencesCollapse",
      source: `// ${OXLINT_DIRECTIVE} no-void -- a\nvoid 0;\n// ${OXLINT_DIRECTIVE} no-void -- b\nvoid 1;`,
      violations: 1,
    },
    {
      fixed: `/* oxlint-disable no-void -- a; b; c */\nvoid 0;\nvoid 1;\nvoid 2;`,
      name: "threeOccurrencesCollapse",
      source: `// ${OXLINT_DIRECTIVE} no-void -- a\nvoid 0;\n// ${OXLINT_DIRECTIVE} no-void -- b\nvoid 1;\n// ${OXLINT_DIRECTIVE} no-void -- c\nvoid 2;`,
      violations: 2,
    },
    // The directives sit inside a function, so their removal takes their indentation with them
    {
      fixed: `/* oxlint-disable no-void -- a; b */\nexport const a = () => {\n  void 0;\n  void 1;\n};`,
      name: "indentedOccurrencesCollapse",
      source: `export const a = () => {\n  // ${OXLINT_DIRECTIVE} no-void -- a\n  void 0;\n  // ${OXLINT_DIRECTIVE} no-void -- b\n  void 1;\n};`,
      violations: 1,
    },
    // The file-level directive goes after a shebang, which stays the first line
    {
      fixed: `#!/usr/bin/env node\n/* oxlint-disable no-void -- a; b */\nvoid 0;\nvoid 1;`,
      name: "shebangKeepsFirstLine",
      source: `#!/usr/bin/env node\n// ${OXLINT_DIRECTIVE} no-void -- a\nvoid 0;\n// ${OXLINT_DIRECTIVE} no-void -- b\nvoid 1;`,
      violations: 1,
    },
    // A combined directive keeps the rule it names that did not repeat, and its reason stays as written
    {
      fixed: `/* oxlint-disable no-void -- a; b */\n// ${OXLINT_DIRECTIVE} no-debugger -- a\nvoid 0;\nvoid 1;`,
      name: "combinedDirectiveKeepsOtherRule",
      source: `// ${OXLINT_DIRECTIVE} no-void, no-debugger -- a\nvoid 0;\n// ${OXLINT_DIRECTIVE} no-void -- b\nvoid 1;`,
      violations: 1,
    },
    // A reason that only points at the reason above it is dropped, since the file-level reason already carries that one
    {
      fixed: `/* oxlint-disable no-void -- a */\nvoid 0;\nvoid 1;`,
      name: "backReferenceReasonDropped",
      source: `// ${OXLINT_DIRECTIVE} no-void -- a\nvoid 0;\n// ${OXLINT_DIRECTIVE} no-void -- As above\nvoid 1;`,
      violations: 1,
    },
    // Nothing is given a reason it did not state
    {
      fixed: `/* oxlint-disable no-void */\nvoid 0;\nvoid 1;`,
      name: "occurrencesWithoutReason",
      source: `// ${OXLINT_DIRECTIVE} no-void\nvoid 0;\n// ${OXLINT_DIRECTIVE} no-void\nvoid 1;`,
      violations: 1,
    },
    // The eslint prefix is its own group, and its file-level directive keeps it
    {
      fixed: `/* eslint-disable no-void -- a; b */\nvoid 0;\nvoid 1;`,
      name: "eslintOccurrencesCollapse",
      source: `// ${ESLINT_DIRECTIVE} no-void -- a\nvoid 0;\n// ${ESLINT_DIRECTIVE} no-void -- b\nvoid 1;`,
      violations: 1,
    },
    // An oxlint and an eslint directive for one rule are each read by one linter, so neither repeats the other
    {
      name: "oxlintAndEslintNotRepeated",
      source: `// ${OXLINT_DIRECTIVE} no-void -- a\nvoid 0;\n// ${ESLINT_DIRECTIVE} no-void -- b\nvoid 1;`,
      violations: 0,
    },
    {
      name: "differentRulesNotRepeated",
      source: `// ${OXLINT_DIRECTIVE} no-void -- a\nvoid 0;\n// ${OXLINT_DIRECTIVE} no-debugger -- b\ndebugger;`,
      violations: 0,
    },
    { name: "singleOccurrenceNotReported", source: `// ${OXLINT_DIRECTIVE} no-void -- a\nvoid 0;`, violations: 0 },
    // A bare directive names no rule, so it is not one to collapse
    {
      name: "bareOccurrencesNotReported",
      source: `// ${OXLINT_DIRECTIVE}\nvoid 0;\n// ${OXLINT_DIRECTIVE}\nvoid 1;`,
      violations: 0,
    },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "comments", rules: [RULE] });
});

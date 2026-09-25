import { setupPluginSuite } from "#src/services/oxlint/setupPluginSuite.test";
import { describe } from "vitest";

describe("comments/no-capitalized-identifier", () => {
  const RULE = "comments/no-capitalized-identifier";
  const FIXTURES = [
    { name: "opensOnCapitalisedDeclaration", source: `// A\n// AB b\nexport const aB = 0;`, violations: 1 },
    { name: "opensOnCapitalisedImport", source: `import { aB } from "a";\n// A\n// AB b\naB();`, violations: 1 },
    { name: "opensOnCapitalisedReference", source: `// A\n// AB b\naB();`, violations: 1 },
    { name: "opensOnCapitalisedMember", source: `// A\n// AB b\na.aB();`, violations: 1 },
    { name: "opensOnCapitalisedSnakeCase", source: `// A\n// A_b c\nexport const a_b = 0;`, violations: 1 },
    // A function prefix and a capital spell a name wherever it is declared, at a sentence start as much as mid-sentence
    { name: "opensOnForeignPrefixedName", source: `// A\n// GetA b\nexport const b = 0;`, violations: 1 },
    { name: "opensSentenceOnPrefixedName", source: `// GetA b\nexport const b = 0;`, violations: 1 },
    { name: "opensOnPrefixedWord", source: `// A\n// Getting b\nexport const b = 0;`, violations: 0 },
    // A single lowercase word reads the same capitalised as the prose word it also is
    { name: "opensOnCapitalisedWord", source: `// A\n// Value b\nexport const value = 0;`, violations: 0 },
    // The capitalised spelling is itself a name in the file, so the comment may mean it
    { name: "opensOnPascalCaseName", source: `// A\n// AB b\nexport class AB {}\nexport const aB = 0;`, violations: 0 },
    // A sentence start may open on a proper name the file binds camel-cased, as `GrapesJS` is imported `grapesJS`
    { name: "opensSentenceOnName", source: `// A.\n// AB b\nexport const aB = 0;`, violations: 0 },
    { name: "opensFirstLineOnName", source: `// AB b\nexport const aB = 0;`, violations: 0 },
    { name: "opensAfterGapOnName", source: `// A\n\n// AB b\nexport const aB = 0;`, violations: 0 },
    // A name the file never spells is the ledger grep's, since nothing in the file says it was ever lowercase
    { name: "opensOnForeignName", source: `// A\n// AB b\nexport const b = 0;`, violations: 0 },
    // A backtick is the spelling the linter leaves alone
    { name: "opensOnBacktickedName", source: `// A\n// \`aB\` b\nexport const aB = 0;`, violations: 0 },
    { name: "namesMidLine", source: `// A aB b\nexport const aB = 0;`, violations: 0 },
    // A block comment is not capitalised, so whatever it opens on was written that way
    { name: "opensBlockOnName", source: `/* A\n AB b */\nexport const aB = 0;`, violations: 0 },
  ];
  setupPluginSuite({
    fixtures: FIXTURES,
    plugin: "comments",
    rules: [RULE],
  });
});

describe("comments/require-directive-reason", () => {
  const RULE = "comments/require-directive-reason";
  const FIXTURES = [
    {
      name: "nextLineWithoutReason",
      source: `// oxlint-disable-next-line no-void
void 0;`,
      violations: 1,
    },
    {
      name: "fileWithoutReason",
      source: `/* eslint-disable a/b */
export const a = 0;`,
      violations: 1,
    },
    { name: "sameLineWithoutReason", source: `void 0; // oxlint-disable-line no-void`, violations: 1 },
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
      source: `// oxlint-disable-next-line no-void --
void 0;`,
      violations: 1,
    },
    {
      name: "nextLineWithReason",
      source: `// oxlint-disable-next-line no-void -- a
void 0;`,
      violations: 0,
    },
    {
      name: "fileWithReason",
      source: `/* eslint-disable a/b -- a */
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
      source: `// A carries an eslint-disable
export const a = 0;`,
      violations: 0,
    },
  ];
  setupPluginSuite({
    fixtures: FIXTURES,
    plugin: "comments",
    rules: [RULE],
  });
});

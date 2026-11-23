import type { Node, ParseError } from "jsonc-parser";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { getResult } from "@esposter/shared";
import { parseTree, printParseErrorCode, stripComments, visit } from "jsonc-parser";
import { readFileSync } from "node:fs";
import { matchesGlob, resolve } from "node:path";
import { describe, expect, test } from "vitest";

interface JsonFile {
  isJsonc: boolean;
  path: string;
  text: string;
}

// A strict file must be JSON by the parser that defines JSON, which rejects every construct the strict rules name.
// A JSONC file is read by jsonc-parser, the one reader here that takes comments and trailing commas and still reports
// Every other fault it finds.
const readSyntaxFaults = (text: string, isJsonc: boolean): string[] => {
  if (!isJsonc)
    return getResult(() => parseMachineJson(text)).match(
      () => [],
      ({ message }) => [message],
    );
  const errors: ParseError[] = [];
  parseTree(text, errors, { allowTrailingComma: true });
  // A parse error carries its offset alone, so its line is counted from the text before it
  return errors.map(
    ({ error, offset }) => `${printParseErrorCode(error)} at line ${text.slice(0, offset).split("\n").length}`,
  );
};

/** The checks on the repository's JSON, held by reading the files, since oxlint reads no JSON. A strict file must
 * parse as JSON; a JSONC file (a tsconfig, a `.vscode` file, a `.jsonc` config) is read with comments and trailing
 * commas, which are its contract. Every rule that config turned on has a fixture below, so a rule that stops reading
 * its input fails here rather than passing in silence. / */
describe("jsonFiles", () => {
  // The generated JSON left out: a drizzle migration snapshot is written and re-read by `db:gen`, an asset is an
  // Export from the tool that drew it, and a vitest snapshot is rewritten by `-u`
  const GENERATED_JSON_FILE_PATTERNS = [
    "**/server/db/migrations/**/*.json",
    "**/app/assets/**/*.json",
    "**/*.snapshot.json",
  ];
  // JSONC by contract rather than by extension, so a comment is legal in them however the suffix reads
  const JSONC_FILE_PATTERNS = [".vscode/**/*.json", "**/tsconfig*.json", "**/*.jsonc"];
  // The escapes a JSON string may hold. `/` is left out: JSON allows it, and `jsonc/no-useless-escape` reports it
  const VALID_ESCAPE_REGEX = /^(?:["\\bfnrt]|u[\da-fA-F]{4})$/u;
  const ESCAPE_REGEX = /\\(?<escape>u[\da-fA-F]{4}|[\s\S])/gu;
  // What `jsonc/no-irregular-whitespace` reports, checked over a comment's text, which the parser does not inspect
  const IRREGULAR_WHITESPACE_REGEX =
    /[\f\v\u{85}\u{FEFF}\u{A0}\u{1680}\u{180E}\u{2000}-\u{200B}\u{202F}\u{205F}\u{3000}]/u;

  const checkIsJsonc = (path: string): boolean => JSONC_FILE_PATTERNS.some((pattern) => matchesGlob(path, pattern));

  const readTrackedJsonFiles = (): JsonFile[] =>
    readSweepFilePaths("*.json", "*.jsonc")
      .filter((path) => !GENERATED_JSON_FILE_PATTERNS.some((pattern) => matchesGlob(path, pattern)))
      .map((path) => ({
        isJsonc: checkIsJsonc(path),
        path,
        text: readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"),
      }));

  // A backslash a string may not hold. Only JSONC has comments to blank first, since a backslash inside one is no
  // Escape
  const readEscapeFaults = (text: string, isJsonc: boolean): string[] =>
    Array.from((isJsonc ? stripComments(text) : text).matchAll(ESCAPE_REGEX), ({ groups }) => groups?.escape ?? "")
      .filter((escape) => !VALID_ESCAPE_REGEX.test(escape))
      .map((escape) => `escape \\${escape} is unneeded or invalid`);

  // Irregular whitespace inside a comment, which `jsonc/no-irregular-whitespace` reports and the parser does not read
  const readCommentWhitespaceFaults = (text: string): string[] => {
    const comments: string[] = [];
    visit(text, {
      onComment: (offset, length) => {
        comments.push(text.slice(offset, offset + length));
      },
    });
    return comments
      .filter((comment) => IRREGULAR_WHITESPACE_REGEX.test(comment))
      .map(() => "irregular whitespace in a comment");
  };

  // The pointers under a parse-tree node: an object's pointers name its keys, and a key seen again in the same object
  // Is a Repeat. JSON.parse keeps only the last of two equal keys, so it cannot see the first, and the parse tree is
  // Read instead
  const readRepeatedPointersIn = (node: Node, pointer: string): string[] => {
    const children = node.children ?? [];
    if (node.type === "array")
      return children.flatMap((child, index) => readRepeatedPointersIn(child, `${pointer}/${index}`));
    if (node.type !== "object") return [];
    const keys = new Set<string>();
    return children.flatMap((property) => {
      const key = String(property.children?.[0]?.value);
      const keyPointer = `${pointer}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`;
      const isRepeated = keys.has(key);
      keys.add(key);
      const value = property.children?.[1];
      return [...(isRepeated ? [keyPointer] : []), ...(value ? readRepeatedPointersIn(value, keyPointer) : [])];
    });
  };

  const readRepeatedKeyPointers = (text: string, isJsonc: boolean): string[] => {
    const root = parseTree(text, [], { allowTrailingComma: isJsonc, disallowComments: !isJsonc });
    // An empty file parses to no tree, and holds no key to repeat
    return root ? readRepeatedPointersIn(root, "") : [];
  };

  // A strict file has no comment for the scan to read: one that would be a fault is already a `JSON.parse` failure
  const readFormatFaults = (text: string, isJsonc: boolean): string[] => [
    ...readSyntaxFaults(text, isJsonc),
    ...readEscapeFaults(text, isJsonc),
    ...(isJsonc ? readCommentWhitespaceFaults(text) : []),
  ];

  // The syntax rules hold in both kinds of file. The comma and comment rules are strict JSON's alone, since JSONC
  // Allows Both, and an irregular space is checked inside a comment only in JSONC
  const SYNTAX_FIXTURES = [
    { name: "a single-quoted string", text: "{'a': 1}" },
    { name: "an unquoted key", text: "{a: 1}" },
    { name: "a plus sign", text: '{"a": +1}' },
    { name: "a leading decimal point", text: '{"a": .5}' },
    { name: "a leading zero", text: '{"a": 01}' },
    { name: "a hexadecimal number", text: '{"a": 0x1F}' },
    { name: "a binary number", text: '{"a": 0b1}' },
    { name: "an octal number", text: '{"a": 0o7}' },
    { name: "a numeric separator", text: '{"a": 1_000}' },
    { name: "a BigInt literal", text: '{"a": 1n}' },
    { name: "Infinity", text: '{"a": Infinity}' },
    { name: "NaN", text: '{"a": NaN}' },
    { name: "undefined", text: '{"a": undefined}' },
    { name: "a template literal", text: '{"a": `x`}' },
    { name: "a regular expression", text: '{"a": /x/}' },
    { name: "a parenthesized value", text: '{"a": (1)}' },
    { name: "a sparse array", text: "[1,,2]" },
    { name: "a binary expression", text: '{"a": 1 + 1}' },
    { name: "a unary operator with a space", text: '{"a": - 1}' },
    { name: "a member access on a number", text: '{"a": 1..toString()}' },
    { name: "an escape in an identifier", text: String.raw`{\u{61}: 1}` },
    { name: "a line continuation in a string", text: '{"a": "x\\\ny"}' },
    { name: "a Unicode code point escape", text: String.raw`{"a": "\u{41}"}` },
    { name: "an escape a string does not need", text: String.raw`{"a": "\/"}` },
    { name: "an escape JSON does not have", text: String.raw`{"a": "\d"}` },
    { name: "an irregular space between tokens", text: '{"a":\u{A0}1}' },
    { name: "a duplicate key", text: '{"a": 1, "a": 2}' },
  ];
  const STRICT_ONLY_FIXTURES = [
    { name: "a comment", text: '{"a": 1 /* c */}' },
    { name: "a trailing comma", text: '{"a": 1,}' },
  ];
  const JSONC_ONLY_FIXTURES = [{ name: "an irregular space in a comment", text: '// a\u{A0}b\n{"a": 1}' }];
  const ALLOWED_FIXTURES = [
    {
      kind: "JSON",
      name: "the escapes JSON allows",
      text: String.raw`{"a": "\n\"\\\b\f\r\t", "b": [1.5e3, -0, true, null]}`,
    },
    { kind: "JSON", name: "a Unicode escape", text: '{"a": "\u{5C}u0041"}' },
    {
      kind: "JSONC",
      name: "a comment and a trailing comma",
      text: '// a comment with a backslash: C:\\path\n{"a": [1,],}',
    },
  ];

  test("a JSON file holds a duplicate key", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(
      readTrackedJsonFiles().flatMap(({ isJsonc, path, text }) =>
        readRepeatedKeyPointers(text, isJsonc).map((pointer) => `${path} ${pointer}`),
      ),
    ).toStrictEqual([]);
  });

  test(
    "every tracked JSON file parses, and holds no escape or irregular whitespace the rules reject",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      expect(
        readTrackedJsonFiles().flatMap(({ isJsonc, path, text }) =>
          readFormatFaults(text, isJsonc).map((fault) => `${path}: ${fault}`),
        ),
      ).toStrictEqual([]);
    },
  );

  test("names the key a fixture object repeats, by its pointer", () => {
    expect.hasAssertions();

    expect(readRepeatedKeyPointers('{"a": {"b": 1, "b": 2}, "c": 3, "c": 4}', false)).toStrictEqual(["/a/b", "/c"]);
  });

  test.each([
    ...SYNTAX_FIXTURES.map((fixture) => ({ ...fixture, kind: "JSON" })),
    ...SYNTAX_FIXTURES.map((fixture) => ({ ...fixture, kind: "JSONC" })),
    ...STRICT_ONLY_FIXTURES.map((fixture) => ({ ...fixture, kind: "JSON" })),
    ...JSONC_ONLY_FIXTURES.map((fixture) => ({ ...fixture, kind: "JSONC" })),
  ])("flags $name in $kind", ({ kind, text }) => {
    expect.hasAssertions();

    const isJsonc = kind === "JSONC";

    expect([...readFormatFaults(text, isJsonc), ...readRepeatedKeyPointers(text, isJsonc)]).not.toStrictEqual([]);
  });

  test.each(ALLOWED_FIXTURES)("accepts $name in $kind", ({ kind, text }) => {
    expect.hasAssertions();

    const isJsonc = kind === "JSONC";

    expect([...readFormatFaults(text, isJsonc), ...readRepeatedKeyPointers(text, isJsonc)]).toStrictEqual([]);
  });
});

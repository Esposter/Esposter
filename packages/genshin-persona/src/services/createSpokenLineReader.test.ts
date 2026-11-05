import { createSpokenLineReader } from "#src/services/createSpokenLineReader";
import { describe, expect, test } from "vitest";

describe(createSpokenLineReader, () => {
  const line = "a";
  const messageId = crypto.randomUUID();
  const otherMessageId = crypto.randomUUID();
  const createPiece = (index: number, markdown: string, isFinal = false, pieceMessageId = messageId) => ({
    index,
    isFinal,
    markdown,
    messageId: pieceMessageId,
  });

  test("reads none of a fence's code when the fence spans three pieces", () => {
    expect.hasAssertions();

    const readSpokenLines = createSpokenLineReader();

    expect(readSpokenLines(createPiece(0, "```\n"))).toStrictEqual([]);
    expect(readSpokenLines(createPiece(1, `> ${line}\n`))).toStrictEqual([]);
    expect(readSpokenLines(createPiece(2, "```\n", true))).toStrictEqual([]);
  });

  test("reads a blockquote line of a piece after the fence closed", () => {
    expect.hasAssertions();

    const readSpokenLines = createSpokenLineReader();

    expect(readSpokenLines(createPiece(0, "```\n"))).toStrictEqual([]);
    expect(readSpokenLines(createPiece(1, `> ${line}\n`))).toStrictEqual([]);
    expect(readSpokenLines(createPiece(2, "```\n"))).toStrictEqual([]);
    expect(readSpokenLines(createPiece(3, `> ${line}\n`, true))).toStrictEqual([line]);
  });

  test("does not carry an unterminated fence from one message into the next", () => {
    expect.hasAssertions();

    const readSpokenLines = createSpokenLineReader();

    expect(readSpokenLines(createPiece(0, "```\n", true))).toStrictEqual([]);
    expect(readSpokenLines(createPiece(0, `> ${line}\n`, true, otherMessageId))).toStrictEqual([line]);
  });

  test("keeps the fence of each of two interleaved messages apart", () => {
    expect.hasAssertions();

    const readSpokenLines = createSpokenLineReader();

    expect(readSpokenLines(createPiece(0, "```\n"))).toStrictEqual([]);
    expect(readSpokenLines(createPiece(0, "```\n", false, otherMessageId))).toStrictEqual([]);
    expect(readSpokenLines(createPiece(1, "> b\n```\n> c\n"))).toStrictEqual(["c"]);
    expect(readSpokenLines(createPiece(1, "> d\n```\n> e\n", true, otherMessageId))).toStrictEqual(["e"]);
  });

  test("reads a blockquote line of a piece that follows a missing one as outside any fence", () => {
    expect.hasAssertions();

    const readSpokenLines = createSpokenLineReader();

    expect(readSpokenLines(createPiece(0, "```\n"))).toStrictEqual([]);
    expect(readSpokenLines(createPiece(2, "> Done.\n", true))).toStrictEqual(["Done."]);
  });

  test.each([
    ["a blockquote inside a fenced block", "```\n> a\n```", []],
    ["a blockquote after a fence the piece never closed", "```\n> a", []],
    ["a tilde fence closed by a tilde fence", "~~~\n> a\n~~~\n> b", ["b"]],
    ["a longer fence closed by one as long", "````\n> a\n````\n> b", ["b"]],
    ["a shorter line of the same character does not close a longer fence", "````\n> a\n```\n> b\n````\n> c", ["c"]],
    ["a line of the other character does not close a fence", "```\n> a\n~~~\n> b\n```\n> c", ["c"]],
    ["a closing line with text after it does not close a fence", "```\n> a\n```python\n> b\n```\n> c", ["c"]],
    ["a closing line with trailing spaces and tabs closes it", "```\n> a\n```  \t\n> b", ["b"]],
    ["a fence inside a blockquote, its code kept in the quote", "> ```\n> a\n> ```\n> b", ["b"]],
    ["a fence indented four spaces hides its quote lines", "    ```\n> a\n    ```\n> b", ["b"]],
    ["a backtick line whose info string holds a backtick is not a fence", "```a```\n> b", ["b"]],
    ["inline code mid-line does not open a fence", "> run `a`\n> b", ["run a", "b"]],
  ])("%s: reads %j", (_case, markdown, expected) => {
    expect.hasAssertions();

    expect(createSpokenLineReader()(createPiece(0, markdown, true))).toStrictEqual(expected);
  });
});

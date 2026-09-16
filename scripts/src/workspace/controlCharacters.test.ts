import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readControlCharacterFindings } from "#src/services/sweeps/controlCharacters/readControlCharacterFindings";
import { describe, expect, test } from "vitest";

/**
 * The `typescript` skill's rule — a non-printing character is written as its `\uXXXX` escape, never the raw byte —
 * held over every tracked file rather than over the one constant that first needed it. Nothing else can hold it:
 * the character renders as nothing, so it is invisible in an editor, in a diff and in a review, and a tool that
 * rewrites the line drops it with no test failing. That is not hypothetical — the repository's own record and
 * field separators were written as raw bytes under a comment claiming they were escapes, and every agent that
 * touched the line since silently rewrote them.
 */
describe("controlCharacters", () => {
  test("no tracked file holds a character that renders as nothing", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(readControlCharacterFindings()).toStrictEqual([]);
  });
});

import { ReleaseVerdict } from "#src/models/coderabbit/collect/ReleaseVerdict";
import { getReleaseVerdict } from "#src/services/coderabbit/collect/getReleaseVerdict";
import { describe, expect, test } from "vitest";

describe(getReleaseVerdict, () => {
  test.each([
    [
      "the session's line",
      "merge — nothing real is left\n",
      { reason: "nothing real is left", verdict: ReleaseVerdict.Merge },
    ],
    [
      "a hold with its concern",
      "hold: the bench rewrites a ledger\n",
      { reason: "the bench rewrites a ledger", verdict: ReleaseVerdict.Hold },
    ],
    [
      "the verb after the marker on the recorded line",
      " Merge — recorded\nThe review at …",
      { reason: "recorded", verdict: ReleaseVerdict.Merge },
    ],
    ["a bare verb", "merge", { reason: "no reason given", verdict: ReleaseVerdict.Merge }],
  ])("reads %s", (_title, text, expected) => {
    expect.hasAssertions();

    expect(getReleaseVerdict(text)).toStrictEqual(expected);
  });

  // A release is never made on a reading nobody reached
  test.each([
    ["nothing", ""],
    ["prose in place of the verb", "I think it is fine to release this.\n"],
    ["a verb inside a word", "submerged\n"],
  ])("holds on %s", (_title, text) => {
    expect.hasAssertions();

    expect(getReleaseVerdict(text)).toStrictEqual({
      reason: "the session gave no verdict",
      verdict: ReleaseVerdict.Hold,
    });
  });
});

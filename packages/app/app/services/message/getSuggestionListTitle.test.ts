import { getSuggestionListTitle } from "@/services/message/getSuggestionListTitle";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { describe, expect, test } from "vitest";

describe(getSuggestionListTitle, () => {
  test("returns the bare title without a query", () => {
    expect.hasAssertions();

    expect(getSuggestionListTitle("EMOJI", SuggestionTrigger.Emoji, "")).toBe("EMOJI");
  });

  test("appends the triggered query when there is one", () => {
    expect.hasAssertions();

    expect(getSuggestionListTitle("MEMBERS", SuggestionTrigger.Mention, "bob")).toBe("MEMBERS MATCHING @bob");
  });
});

import { renderOutcomeTable } from "#src/services/review/issues/renderOutcomeTable";
import { describe, expect, test } from "vitest";

describe(renderOutcomeTable, () => {
  test("escapes a pipe in a finding or a reason, so it cannot end the cell early", () => {
    expect.hasAssertions();

    expect(renderOutcomeTable([{ finding: "a | b", outcome: "fixed", reason: "c | d" }])).toBe(
      ["| Finding | Outcome | Reason |", "| --- | --- | --- |", String.raw`| a \| b | fixed | c \| d |`].join("\n"),
    );
  });
});

import { formatResumeRows } from "#src/services/resume/formatResumeRows";
import { describe, expect, test } from "vitest";

describe(formatResumeRows, () => {
  test("prints ok, an error, and items with a repeated action once", () => {
    expect.hasAssertions();

    expect(
      formatResumeRows([
        { error: "", items: [], name: "tree" },
        { error: "no network", items: [], name: "queue" },
        {
          error: "",
          items: [
            { action: "do", text: "a" },
            { action: "do", text: "b" },
          ],
          name: "holds",
        },
      ]),
    ).toStrictEqual([
      "check  state              action",
      "-----  -----------------  ------",
      "tree   ok",
      "queue  error: no network",
      "holds  a                  do",
      "       b",
    ]);
  });
});

import { readTickedVerifyClauses } from "#src/services/openspec/readTickedVerifyClauses";
import { describe, expect, test } from "vitest";

describe(readTickedVerifyClauses, () => {
  test("reads a ticked task's Verify clause to the end of its lines", () => {
    expect.hasAssertions();

    const tasksText = [
      "- [x] 1.1 Build it. Verify: the first line",
      "  and the second line.",
      "",
      "- [x] 1.2 Next.",
    ].join("\n");

    expect(readTickedVerifyClauses(tasksText)).toStrictEqual([
      { number: "1.1", verify: "Verify: the first line\n  and the second line." },
    ]);
  });

  test("stops a clause at the next bullet or heading", () => {
    expect.hasAssertions();

    const tasksText = ["- [x] 1.1 Build it. Verify: a.", "- [x] 1.2 Test it. Verify: b.", "## 2. More"].join("\n");

    expect(readTickedVerifyClauses(tasksText)).toStrictEqual([
      { number: "1.1", verify: "Verify: a." },
      { number: "1.2", verify: "Verify: b." },
    ]);
  });

  test("leaves out a task that is open or has no Verify clause", () => {
    expect.hasAssertions();

    const tasksText = ["- [ ] 1.1 Build it. Verify: a.", "- [x] 1.2 Test it."].join("\n");

    expect(readTickedVerifyClauses(tasksText)).toStrictEqual([]);
  });
});

import { indexPages } from "#src/services/skills/extract/indexPages";
import { describe, expect, test } from "vitest";

describe(indexPages, () => {
  const indexLine = "- `references/c.md`";

  test("appends to the end of the index list, before the next section", () => {
    expect.hasAssertions();

    expect(indexPages("# a\n\n## Deep Dives\n\n- `references/b.md`\n\n## d\n", [indexLine])).toBe(
      "# a\n\n## Deep Dives\n\n- `references/b.md`\n- `references/c.md`\n\n## d\n",
    );
  });

  test("creates the index heading at the end when the skill has none", () => {
    expect.hasAssertions();

    expect(indexPages("# a\n", [indexLine], "## Reference pages")).toBe(
      "# a\n\n## Reference pages\n\n- `references/c.md`\n",
    );
  });
});

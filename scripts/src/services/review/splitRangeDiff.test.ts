import { splitRangeDiff } from "#src/services/review/splitRangeDiff";
import { describe, expect, test } from "vitest";

const diff = `diff --git a/a.ts b/a.ts
index 1111111..2222222 100644
--- a/a.ts
+++ b/a.ts
@@ -1 +1 @@
-const a = 1;
+const a = 2;
diff --git a/b.ts b/b.ts
new file mode 100644
index 0000000..3333333
--- /dev/null
+++ b/b.ts
@@ -0,0 +1 @@
+const b = 1;
`;

describe(splitRangeDiff, () => {
  test("splits a diff into one chunk per file, each from its header to the next", () => {
    expect.hasAssertions();

    expect(splitRangeDiff(diff)).toStrictEqual([
      diff.slice(0, diff.indexOf("diff --git a/b.ts")),
      diff.slice(diff.indexOf("diff --git a/b.ts")),
    ]);
  });

  test("concatenates the chunks back to the input", () => {
    expect.hasAssertions();

    expect(splitRangeDiff(diff).join("")).toBe(diff);
  });

  test("gives no chunks for an empty diff", () => {
    expect.hasAssertions();

    expect(splitRangeDiff("")).toStrictEqual([]);
  });
});

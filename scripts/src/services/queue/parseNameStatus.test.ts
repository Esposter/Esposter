import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { parseNameStatus } from "#src/services/queue/parseNameStatus";
import { describe, expect, test } from "vitest";

describe(parseNameStatus, () => {
  test("pairs each NUL-separated status with the path it names", () => {
    expect.hasAssertions();

    expect(parseNameStatus("A\0packages/a/src/b.ts\0M\0apps/web/c.vue\0D\0d.ts\0")).toStrictEqual([
      { path: "packages/a/src/b.ts", status: ChangeStatus.Added },
      { path: "apps/web/c.vue", status: ChangeStatus.Modified },
      { path: "d.ts", status: ChangeStatus.Deleted },
    ]);
  });

  test("reads an empty listing as no changes", () => {
    expect.hasAssertions();

    expect(parseNameStatus("")).toStrictEqual([]);
  });
});

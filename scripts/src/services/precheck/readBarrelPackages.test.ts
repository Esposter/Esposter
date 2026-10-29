import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { readBarrelPackages } from "#src/services/precheck/readBarrelPackages";
import { describe, expect, test } from "vitest";

describe(readBarrelPackages, () => {
  test("names each package whose src gained or lost a file, once, and no other", () => {
    expect.hasAssertions();

    expect(
      readBarrelPackages([
        { path: "packages/genshin-world/src/kit/New.ts", status: ChangeStatus.Added },
        { path: "packages/shared/src/util/Old.ts", status: ChangeStatus.Deleted },
        { path: "packages/shared/src/util/Kept.ts", status: ChangeStatus.Modified },
        { path: "packages/shared/src/util/Other.ts", status: ChangeStatus.Deleted },
        { path: "packages/shared/README.md", status: ChangeStatus.Added },
      ]),
    ).toStrictEqual(["packages/genshin-world", "packages/shared"]);
  });
});

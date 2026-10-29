import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { readBarrelPackages } from "#src/services/precheck/readBarrelPackages";
import { describe, expect, test } from "vitest";

describe(readBarrelPackages, () => {
  // A module's barrel line depends on whether it exports anything, so a file changed in place can add or remove one
  test("names each package whose src changed in any way, once, and no other", () => {
    expect.hasAssertions();

    expect(
      readBarrelPackages([
        { path: "packages/genshin-world/src/kit/New.ts", status: ChangeStatus.Added },
        { path: "packages/shared/src/util/Old.ts", status: ChangeStatus.Deleted },
        { path: "packages/shared/src/util/Kept.ts", status: ChangeStatus.Modified },
        { path: "packages/shared/src/util/Other.ts", status: ChangeStatus.Deleted },
        { path: "packages/shared/README.md", status: ChangeStatus.Added },
        { path: "packages/vue-phaserjs/src/Scene.ts", status: ChangeStatus.Modified },
      ]),
    ).toStrictEqual(["packages/genshin-world", "packages/shared", "packages/vue-phaserjs"]);
  });
});

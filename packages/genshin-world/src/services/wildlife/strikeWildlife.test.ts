import type { Wildlife } from "#src/models/wildlife/Wildlife";

import { WildlifeKind } from "#src/models/wildlife/WildlifeKind";
import { createWildlife } from "#src/services/wildlife/createWildlife";
import { strikeWildlife } from "#src/services/wildlife/strikeWildlife";
import { describe, expect, test } from "vitest";

const createCrimsonFox = (): Wildlife =>
  createWildlife({ id: "fox", kind: WildlifeKind.CrimsonFox, position: { x: 0, z: 0 } });

describe(strikeWildlife, () => {
  test("a Crimson Fox gives two Raw Meat when struck", () => {
    expect.hasAssertions();

    expect(strikeWildlife(createCrimsonFox())).toStrictEqual({ count: 2, itemId: 100_061 });
  });

  test("a struck animal gives nothing when struck again", () => {
    expect.hasAssertions();

    const crimsonFox = createCrimsonFox();
    strikeWildlife(crimsonFox);
    expect(strikeWildlife(crimsonFox)).toBeUndefined();
  });
});

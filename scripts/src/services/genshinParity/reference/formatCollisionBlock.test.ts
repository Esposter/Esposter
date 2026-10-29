import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";

import { formatCollisionBlock } from "#src/services/genshinParity/reference/formatCollisionBlock";
import { describe, expect, test } from "vitest";

describe(formatCollisionBlock, () => {
  test("names each colliding id with the leading digits of its local and committed hashes, on one line", () => {
    expect.hasAssertions();
    const OURS = "1".repeat(64);
    const COMMITTED = "0".repeat(64);
    const collisions: ReferenceCollision[] = [
      { committed: COMMITTED, id: "a", ours: OURS },
      { committed: COMMITTED, id: "b", ours: OURS },
    ];
    expect(formatCollisionBlock(collisions)).toBe(
      "colliding 2: a (ours 11111111 vs committed 00000000), b (ours 11111111 vs committed 00000000)",
    );
  });
});

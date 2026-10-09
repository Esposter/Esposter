import { parseComputeQueueItem } from "#src/services/fleet/parseComputeQueueItem";
import { describe, expect, test } from "vitest";

describe(parseComputeQueueItem, () => {
  test("reads an item's id, its needs and the paths its Writes sentence names", () => {
    expect.hasAssertions();

    expect(
      parseComputeQueueItem(
        "- [ ] `[cpu]` {liyue-capital} needs game-install, game-exports — **Liyue.** Reads `extracted/liyue/`. Writes `extracted/liyue/world/world.json` and `packages/genshin-world/src/data/liyue.json`: the capital.",
      ),
    ).toStrictEqual({
      area: "genshin",
      id: "liyue-capital",
      needs: ["game-install", "game-exports"],
      touches: ["extracted/liyue/world/world.json", "packages/genshin-world/src/data/liyue.json"],
    });
  });

  test("reads an item without needs as needing nothing, and a constant named in prose as no path", () => {
    expect.hasAssertions();

    expect(
      parseComputeQueueItem(
        "- [ ] `[page]` {login-door} — Writes `INTERACTION_WINDOW_SIZE` in `packages/a/constants.ts`.",
      ),
    ).toStrictEqual({ area: "genshin", id: "login-door", needs: [], touches: ["packages/a/constants.ts"] });
  });

  test("reads a line without an id, or a line not an open item, as no entry", () => {
    expect.hasAssertions();

    expect(parseComputeQueueItem("- [ ] `[cpu]` **Untitled.** Writes `a.ts`.")).toBeUndefined();
    expect(parseComputeQueueItem("- [x] `[cpu]` {done-item} — Writes `a.ts`.")).toBeUndefined();
  });
});

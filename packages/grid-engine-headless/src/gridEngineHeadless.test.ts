import { describe, expect, test, vi } from "vitest";

// A spy in place of Phaser's module: if the core imports Phaser, the factory runs and the spy records it
const { loadPhaser } = vi.hoisted(() => ({ loadPhaser: vi.fn<() => object>(() => ({})) }));
// oxlint-disable-next-line vitest/prefer-import-in-mock -- the package does not depend on phaser, so import("phaser") cannot be typed here, and the name is the one the core must not load
vi.mock("phaser", () => loadPhaser());

describe("gridEngineHeadless", () => {
  test("importing the core loads no Phaser module in a Node environment (#553)", async () => {
    expect.hasAssertions();

    await import("#src/gridEngineHeadless");

    expect(loadPhaser).not.toHaveBeenCalled();
  });
});

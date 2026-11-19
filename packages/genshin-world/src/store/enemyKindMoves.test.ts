import type { BossMove } from "#src/models/bosses/BossMove";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnemyKindMovesLoaderMap } from "#src/services/bosses/EnemyKindMovesLoaderMap";
import { useWorldEnemyKindMovesStore } from "#src/store/enemyKindMoves";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { watch } from "vue";

// Resolves on the store's next write to the value the getter reads, which is the completion a request waits for
const nextWrite = (read: () => unknown): Promise<void> =>
  new Promise((resolve) => {
    watch(
      read,
      () => {
        resolve();
      },
      { once: true },
    );
  });

describe(useWorldEnemyKindMovesStore, () => {
  const MOVES: readonly BossMove[] = [];
  const KIND = EnemyKindId.AeonblightDrake;
  const originalLoader = EnemyKindMovesLoaderMap[KIND];

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.spyOn(console, "error").mockImplementation(() => {
      // A failed load is logged, and each test asserts the store's own write rather than the log
    });
  });

  afterEach(() => {
    if (originalLoader) EnemyKindMovesLoaderMap[KIND] = originalLoader;
    vi.restoreAllMocks();
  });

  test("a failed boss-moves load is asked for again", async () => {
    expect.hasAssertions();

    const loadMoves = vi
      .fn<() => Promise<readonly BossMove[]>>()
      .mockRejectedValueOnce(new Error("load failed"))
      .mockResolvedValue(MOVES);
    EnemyKindMovesLoaderMap[KIND] = loadMoves;
    const worldEnemyKindMovesStore = useWorldEnemyKindMovesStore();

    const failed = nextWrite(() => worldEnemyKindMovesStore.enemyKindMovesFailureMap[KIND]);
    worldEnemyKindMovesStore.loadEnemyKindMoves([KIND]);
    await failed;
    expect(worldEnemyKindMovesStore.enemyKindMovesFailureMap[KIND]).toBe(1);

    // The failure is a write the camps watch, and the kind is no longer held as requested, so the next camp asks again
    const loaded = nextWrite(() => worldEnemyKindMovesStore.enemyKindMovesMap[KIND]);
    expect(worldEnemyKindMovesStore.loadEnemyKindMoves([KIND])).toBe(true);
    await loaded;

    expect(worldEnemyKindMovesStore.enemyKindMovesMap[KIND]).toBe(MOVES);
    expect(loadMoves).toHaveBeenCalledTimes(2);
  });

  test("a boss whose moves keep failing stays unspawned", async () => {
    expect.hasAssertions();

    const loadMoves = vi.fn<() => Promise<readonly BossMove[]>>().mockRejectedValue(new Error("load failed"));
    EnemyKindMovesLoaderMap[KIND] = loadMoves;
    const worldEnemyKindMovesStore = useWorldEnemyKindMovesStore();
    // One attempt: a request, waiting on the failure it writes
    const attempt = (): Promise<void> => {
      const failed = nextWrite(() => worldEnemyKindMovesStore.enemyKindMovesFailureMap[KIND]);
      worldEnemyKindMovesStore.loadEnemyKindMoves([KIND]);
      return failed;
    };

    await attempt();
    await attempt();
    await attempt();

    // Its camps keep waiting, and the third failure is final, so no fourth request is made
    expect(worldEnemyKindMovesStore.enemyKindMovesFailureMap[KIND]).toBe(3);
    expect(worldEnemyKindMovesStore.loadEnemyKindMoves([KIND])).toBe(true);
    expect(loadMoves).toHaveBeenCalledTimes(3);
    expect(worldEnemyKindMovesStore.enemyKindMovesMap[KIND]).toBeUndefined();
  });
});

import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { useWorldArchiveStore } from "#src/store/archive";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test } from "vitest";

describe(useWorldArchiveStore, () => {
  const ENEMY_KIND_ID = 21_010_101;
  const ENTRY_ID = 5;
  const BOOK = { bodyId: 2, id: 1, materialId: 10, nameTextId: "3" };
  const enemyKindMap = new Map([[ENEMY_KIND_ID, { archiveEntryId: ENTRY_ID } as EnemyKind]]);

  const setUpArchive = () => {
    const worldSessionStore = startTestWorldSession();
    const worldArchiveStore = useWorldArchiveStore();
    worldArchiveStore.start({ archiveKillsMap: new Map(), archiveProgressMap: new Map(), enemyKindMap });
    return { worldArchiveStore, worldSessionStore };
  };

  test("a defeated enemy opens its entry and is counted under it", () => {
    expect.hasAssertions();

    const { worldArchiveStore, worldSessionStore } = setUpArchive();
    worldSessionStore.events.emit("defeatEnemy", { enemyKindId: ENEMY_KIND_ID } as Enemy);
    worldSessionStore.events.emit("defeatEnemy", { enemyKindId: ENEMY_KIND_ID } as Enemy);

    expect({ kills: worldArchiveStore.archiveKillsMap, progress: worldArchiveStore.archiveProgressMap }).toStrictEqual({
      kills: new Map([[ENTRY_ID, 2]]),
      progress: new Map([[ArchiveSection.LivingBeings, new Set([ENTRY_ID])]]),
    });
  });

  test("a volume picked up opens its entry once the Archive is read, and any other item is left for the bag", () => {
    expect.hasAssertions();

    const { worldArchiveStore } = setUpArchive();
    expect(worldArchiveStore.takeBook(BOOK.materialId)).toBe(false);

    worldArchiveStore.archiveData = {
      sectionEntriesMap: { [ArchiveSection.Books]: [BOOK] } as unknown as NonNullable<
        typeof worldArchiveStore.archiveData
      >["sectionEntriesMap"],
      textMap: {},
    };
    expect(worldArchiveStore.takeBook(BOOK.materialId + 1)).toBe(false);
    expect(worldArchiveStore.takeBook(BOOK.materialId)).toBe(true);
    expect(worldArchiveStore.archiveProgressMap).toStrictEqual(new Map([[ArchiveSection.Books, new Set([BOOK.id])]]));
  });

  test("stopping the store forgets the progress, the defeats and the entries", () => {
    expect.hasAssertions();

    const { worldArchiveStore, worldSessionStore } = setUpArchive();
    worldSessionStore.events.emit("defeatEnemy", { enemyKindId: ENEMY_KIND_ID } as Enemy);
    worldArchiveStore.stop();

    expect({
      archiveData: worldArchiveStore.archiveData,
      kills: worldArchiveStore.archiveKillsMap.size,
      progress: worldArchiveStore.archiveProgressMap.size,
    }).toStrictEqual({ archiveData: undefined, kills: 0, progress: 0 });
  });
});

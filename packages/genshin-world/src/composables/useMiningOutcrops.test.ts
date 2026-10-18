import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";
import type { OreHit } from "#src/models/gathering/OreHit";
import type { KitBody } from "#src/models/kit/KitBody";
import type { WorldDrop } from "#src/models/world/WorldDrop";

import { useMiningOutcrops } from "#src/composables/useMiningOutcrops";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { describe, expect, test, vi } from "vitest";
import { ref } from "vue";

describe("useMiningOutcrops", () => {
  // The resets, 04:00 in UTC+8 on two game days: 20:00 UTC of the day before each day, counted from the epoch
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const resetDay1 = epoch.add({ hours: 480_000 }).subtract({ hours: 4 });
  const resetDay2 = resetDay1.add({ hours: 24 });
  const places: GatheringPlace[] = [
    { id: "a", kind: 101_004, position: { x: 0, z: 0 } },
    { id: "b", kind: 101_004, position: { x: 50, z: 50 } },
  ];
  const body: KitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  // A claymore's normal attack breaks an outcrop in one hit: its poise damage is the outcrop's melee requirement
  const claymoreHit: OreHit = {
    hitArea: { angle: Math.PI * 2, height: 2, radius: 3 },
    isBlunt: false,
    isMelee: true,
    poiseDamage: 2000,
  };
  // The region is placed directly rather than read, so the composable requests none of the game data
  const setup = () => {
    const now = { value: resetDay1.add({ hours: 6 }) };
    const placeWorldDrops = vi.fn<(source: Pick<WorldDrop, "id" | "position">, droppedItems: DroppedItem[]) => void>();
    const mining = useMiningOutcrops({
      events: createWorldEvents(),
      gameDataBaseUrl: "https://example.test",
      getWorldNow: () => now.value,
      placeWorldDrops,
      rank: ref(30),
      regionIds: ref<string[]>([]),
    });
    mining.placesMap.value = new Map([["mondstadt", places]]);
    return { mining, now, placeWorldDrops };
  };

  test("a claymore break drops the outcrop's ore and leaves it gone until the next reset", () => {
    expect.hasAssertions();
    const { mining, now, placeWorldDrops } = setup();
    mining.refreshMiningOutcrops(now.value, () => 0.5);
    expect(mining.standingMiningOutcrops.value.map(({ id }) => id)).toStrictEqual(["a", "b"]);
    mining.strikeMiningOutcrops(body, claymoreHit, () => 0.5);
    expect(placeWorldDrops).toHaveBeenCalledWith({ id: "a", position: places[0]?.position }, [
      { count: 1, itemId: 101_004 },
    ]);
    mining.refreshMiningOutcrops(now.value, () => 0.5);
    expect(mining.standingMiningOutcrops.value.map(({ id }) => id)).toStrictEqual(["b"]);
    now.value = resetDay2;
    mining.refreshMiningOutcrops(now.value, () => 0.5);
    expect(mining.standingMiningOutcrops.value.map(({ id }) => id)).toStrictEqual(["a", "b"]);
  });

  test("a strike out of reach breaks no outcrop", () => {
    expect.hasAssertions();
    const { mining, now, placeWorldDrops } = setup();
    mining.refreshMiningOutcrops(now.value, () => 0.5);
    mining.strikeMiningOutcrops({ ...body, position: { x: 100, z: 100 } }, claymoreHit, () => 0.5);
    expect(placeWorldDrops).not.toHaveBeenCalled();
    expect(mining.standingMiningOutcrops.value).toHaveLength(2);
  });
});

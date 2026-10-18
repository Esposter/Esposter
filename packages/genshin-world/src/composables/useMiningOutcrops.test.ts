import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";
import type { OreHit } from "#src/models/gathering/OreHit";
import type { KitBody } from "#src/models/kit/KitBody";

import { useMiningOutcrops } from "#src/composables/useMiningOutcrops";
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
    const breakOre = vi.fn<(place: Pick<GatheringPlace, "id" | "kind" | "position">, random: () => number) => void>();
    const mining = useMiningOutcrops({
      breakOre,
      gameDataBaseUrl: "https://example.test",
      getWorldNow: () => now.value,
      rank: ref(30),
      regionIds: ref<string[]>([]),
    });
    mining.placesMap.value = new Map([["mondstadt", places]]);
    return { breakOre, mining, now };
  };

  test("a claymore break drops the outcrop's ore and leaves it gone until the next reset", () => {
    expect.hasAssertions();
    const { breakOre, mining, now } = setup();
    mining.refreshMiningOutcrops(now.value, () => 0.5);
    expect(mining.standingMiningOutcrops.value.map(({ id }) => id)).toStrictEqual(["a", "b"]);
    mining.strikeMiningOutcrops(body, claymoreHit, () => 0.5);
    expect(breakOre.mock.calls.map(([place]) => place)).toStrictEqual([places[0]]);
    mining.refreshMiningOutcrops(now.value, () => 0.5);
    expect(mining.standingMiningOutcrops.value.map(({ id }) => id)).toStrictEqual(["b"]);
    now.value = resetDay2;
    mining.refreshMiningOutcrops(now.value, () => 0.5);
    expect(mining.standingMiningOutcrops.value.map(({ id }) => id)).toStrictEqual(["a", "b"]);
  });

  test("a strike out of reach breaks no outcrop", () => {
    expect.hasAssertions();
    const { breakOre, mining, now } = setup();
    mining.refreshMiningOutcrops(now.value, () => 0.5);
    mining.strikeMiningOutcrops({ ...body, position: { x: 100, z: 100 } }, claymoreHit, () => 0.5);
    expect(breakOre).not.toHaveBeenCalled();
    expect(mining.standingMiningOutcrops.value).toHaveLength(2);
  });
});

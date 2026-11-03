import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";
import type { MinedOutcrop } from "#src/models/gathering/MinedOutcrop";
import type { OreHit } from "#src/models/gathering/OreHit";
import type { KitBody } from "#src/models/kit/KitBody";

import { useMiningOutcrops } from "#src/composables/useMiningOutcrops";
import { startTestAdventureRank } from "#src/store/adventureRank.fixture";
import { useWorldPickupsStore } from "#src/store/pickups";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test, vi } from "vitest";
import { ref } from "vue";

const random = () => 0.5;

describe(useMiningOutcrops, () => {
  // The draws, 06:00 in UTC+8 on two game days: 22:00 UTC of the day before each day, counted from the epoch
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const drawDay1 = epoch.add({ hours: 480_000 }).subtract({ hours: 2 });
  const drawDay2 = drawDay1.add({ hours: 24 });
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
  const setup = (savedMinedOutcrops: MinedOutcrop[] = []) => {
    const now = { value: drawDay1.add({ hours: 6 }) };
    startTestWorldSession({ gameDataBaseUrl: "https://example.test", getWorldNow: () => now.value });
    startTestAdventureRank(30);
    const worldPickupsStore = useWorldPickupsStore();
    const breakOre = vi.spyOn(worldPickupsStore, "breakOre").mockImplementation(() => {});
    const mining = useMiningOutcrops({ regionIds: ref<string[]>([]), savedMinedOutcrops });
    mining.placesMap.value = new Map([["mondstadt", places]]);
    return { breakOre, mining, now };
  };

  test("a claymore break drops the outcrop's ore and leaves it gone until its 06:00 respawn", () => {
    expect.hasAssertions();
    const { breakOre, mining, now } = setup();
    mining.refreshMiningOutcrops(now.value, random);
    expect(mining.standingMiningOutcrops.value.map(({ id }) => id)).toStrictEqual(["a", "b"]);
    mining.strikeMiningOutcrops(body, claymoreHit, random);
    expect(breakOre).toHaveBeenCalledExactlyOnceWith(places[0], random);
    mining.refreshMiningOutcrops(now.value, random);
    expect(mining.standingMiningOutcrops.value.map(({ id }) => id)).toStrictEqual(["b"]);
    now.value = drawDay2;
    mining.refreshMiningOutcrops(now.value, random);
    expect(mining.standingMiningOutcrops.value.map(({ id }) => id)).toStrictEqual(["a", "b"]);
  });

  test("a reload keeps a mined outcrop gone past the 04:00 reset until its 06:00 respawn", () => {
    expect.hasAssertions();
    const { mining, now } = setup([{ id: "a", minedAt: drawDay1.add({ hours: 5 }) }]);
    mining.refreshMiningOutcrops(now.value, random);
    expect(mining.standingMiningOutcrops.value.map(({ id }) => id)).toStrictEqual(["b"]);
    now.value = drawDay2.subtract({ minutes: 1 });
    mining.refreshMiningOutcrops(now.value, random);
    expect(mining.standingMiningOutcrops.value.map(({ id }) => id)).toStrictEqual(["b"]);
    now.value = drawDay2;
    mining.refreshMiningOutcrops(now.value, random);
    expect(mining.standingMiningOutcrops.value.map(({ id }) => id)).toStrictEqual(["a", "b"]);
  });

  test("a strike out of reach breaks no outcrop", () => {
    expect.hasAssertions();
    const { breakOre, mining, now } = setup();
    mining.refreshMiningOutcrops(now.value, random);
    mining.strikeMiningOutcrops({ ...body, position: { x: 100, z: 100 } }, claymoreHit, random);
    expect(breakOre).not.toHaveBeenCalled();
    expect(mining.standingMiningOutcrops.value).toHaveLength(2);
  });
});

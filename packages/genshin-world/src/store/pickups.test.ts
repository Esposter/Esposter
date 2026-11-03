import { Currency } from "#src/models/inventory/Currency";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { startTestWorldGround } from "#src/store/ground.fixture";
import { useWorldPickupsStore } from "#src/store/pickups";
import { startTestWorldSession } from "#src/store/session.fixture";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test, vi } from "vitest";

describe(useWorldPickupsStore, () => {
  const SOURCE = { id: "wolf", position: { x: 1, z: 2 } };
  const MORA_COUNT = 40;
  const GROUND_HEIGHT = 5;

  const setUpPickups = () => {
    const worldSessionStore = startTestWorldSession();
    startTestWorldGround(GROUND_HEIGHT);
    const worldPickupsStore = useWorldPickupsStore();
    worldPickupsStore.start({ reliquaryPieceEntryMap: new Map(), weaponDataMap: new Map() });
    return { worldPickupsStore, worldSessionStore };
  };

  test("the drops a source leaves are numbered from the drops placed before them and lie on the ground", () => {
    expect.hasAssertions();

    const { worldPickupsStore } = setUpPickups();
    worldPickupsStore.placeWorldDrops(SOURCE, [{ count: MORA_COUNT, itemId: MORA_ITEM_ID }]);
    worldPickupsStore.placeWorldDrops(SOURCE, [{ count: 1, itemId: MORA_ITEM_ID }]);

    expect({
      ids: worldPickupsStore.worldDrops.map(({ id }) => id),
      positions: worldPickupsStore.pickUpInteractables.map(({ kind, position }) => [kind, position.y]),
    }).toStrictEqual({
      ids: ["wolf|0", "wolf|1"],
      positions: [
        [InteractionKind.PickUp, GROUND_HEIGHT],
        [InteractionKind.PickUp, GROUND_HEIGHT],
      ],
    });
  });

  test("a Mora drop picked up goes into the wallet, leaves the ground and is told to the kits", () => {
    expect.hasAssertions();

    const { worldPickupsStore, worldSessionStore } = setUpPickups();
    const onPickUpMora = vi.fn<() => void>();
    worldSessionStore.events.on("pickUpMora", onPickUpMora);
    worldPickupsStore.placeWorldDrops(SOURCE, [{ count: MORA_COUNT, itemId: MORA_ITEM_ID }]);
    const [worldDrop] = worldPickupsStore.worldDrops;
    if (!worldDrop) throw new Error("no drop was placed");
    worldPickupsStore.pickUpWorldDrop(worldDrop);

    expect({
      drops: worldPickupsStore.worldDrops,
      mora: worldSessionStore.wallet[Currency.Mora],
      told: onPickUpMora.mock.calls.length,
    }).toStrictEqual({ drops: [], mora: MORA_COUNT, told: 1 });
  });

  test("stopping the store takes the drops off the ground and numbers the next ones from the start", () => {
    expect.hasAssertions();

    const { worldPickupsStore } = setUpPickups();
    worldPickupsStore.placeWorldDrops(SOURCE, [{ count: 1, itemId: MORA_ITEM_ID }]);
    worldPickupsStore.stop();
    worldPickupsStore.placeWorldDrops(SOURCE, [{ count: 1, itemId: MORA_ITEM_ID }]);

    expect(worldPickupsStore.worldDrops.map(({ id }) => id)).toStrictEqual(["wolf|0"]);
  });
});

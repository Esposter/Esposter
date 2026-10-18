import type { Enemy } from "#src/models/enemy/Enemy";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";

import { useWorldOutcrops } from "#src/composables/useWorldOutcrops";
import { Currency } from "#src/models/inventory/Currency";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { describe, expect, test } from "vitest";
import { ref } from "vue";

const PLACEMENTS = [
  { id: 1, position: { x: 0, z: 0 } },
  { id: 2, position: { x: 100, z: 0 } },
];
const KIND_RULES: OutcropKindRule[] = [
  {
    kind: OutcropKind.Revelation,
    playerLevel: 1,
    unlockCityIds: [],
    worldLevelRewards: [[{ itemId: MORA_ITEM_ID, maxCount: 100, minCount: 100 }]],
  },
];

describe("useWorldOutcrops", () => {
  test("a touch spawns the outcrop's camp, and the last enemy's defeat leaves it claimable", () => {
    expect.hasAssertions();

    const events = createWorldEvents();
    const wallet = ref<Wallet>({ ...EMPTY_WALLET });
    const inventory = ref<Inventory>({ ...EMPTY_INVENTORY });
    const outcrops = useWorldOutcrops({
      areaId: ref("mondstadt"),
      enemyMap: new Map(),
      events,
      gameText: {},
      getGroundHeight: () => 0,
      inventory,
      kindRules: ref(KIND_RULES),
      materialDataMap: new Map(),
      nameText: {},
      placements: ref(PLACEMENTS),
      setInventory: (nextInventory) => {
        inventory.value = nextInventory;
      },
      setWallet: (nextWallet) => {
        wallet.value = nextWallet;
      },
      wallet,
    });

    outcrops.resetOutcrops(30, [], () => 0);
    outcrops.touchOutcropsNear(0, 0, () => 0);
    expect(outcrops.outcropCamps.value.map(({ id }) => id)).toStrictEqual(["outcrop-1"]);

    events.emit("defeatEnemy", { campId: "outcrop-1", id: "0", state: EnemyState.Dead } as Enemy);
    expect(outcrops.outcropCamps.value).toStrictEqual([]);
    expect(outcrops.outcropInteractables.value.map(({ id }) => id)).toStrictEqual(["1"]);

    outcrops.claimOutcropById(1, 0, () => 0);
    expect(wallet.value[Currency.Mora]).toBe(EMPTY_WALLET[Currency.Mora] + 100);
    expect(outcrops.outcrops.value).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: 2, stage: OutcropStage.Waiting },
    ]);
  });
});

// @vitest-environment nuxt
import type { Item } from "#shared/models/dungeons/item/Item";
import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { ItemEffectType } from "#shared/models/dungeons/item/ItemEffectType";
import { MONSTER_PARTY_MAX_LENGTH } from "#shared/services/dungeons/constants";
import { CaptureItemResolver } from "@/models/resolvers/dungeons/item/CaptureItemResolver";
import { useInventoryInfoPanelStore } from "@/store/dungeons/inventory/infoPanel";
import { usePlayerStore } from "@/store/dungeons/player";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The party lives on the player, and the player store reads the dungeons store, which imports Phaser. Only the party is
// Read here, so the fake holds one
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("@/store/dungeons/player", async () => {
  const { reactive } = await import("vue");
  const player = reactive({ monsters: [] as Monster[] });
  return { usePlayerStore: () => ({ player }) };
});
// The capture only reads the party and the info panel, so the monster party's panel store, which loads the dialog and
// With it Phaser, is faked out
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser through the dialog store
vi.mock("@/store/dungeons/monsterParty/infoPanel", () => ({ useMonsterPartyInfoPanelStore: () => ({}) }));
// The battle and its event emitter load Phaser, which cannot initialise under the test environment. A capture reaches them
// Only once it goes ahead, so these fakes stand in for them
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser
vi.mock("@/services/dungeons/scene/battle/battleStateMachine", () => ({ battleStateMachine: {} }));
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser
vi.mock("@/services/phaser/phaserEventEmitter", () => ({ phaserEventEmitter: {} }));

describe(CaptureItemResolver, () => {
  let item: Item;

  beforeEach(() => {
    item = {
      description: "description",
      effect: { type: ItemEffectType.Capture, value: 0 },
      id: ItemId.Potion,
      quantity: 1,
    };
    const playerStore = usePlayerStore();
    playerStore.player.monsters = [];
  });

  test("refuses a capture and says why while the party is full", () => {
    expect.hasAssertions();

    const playerStore = usePlayerStore();
    playerStore.player.monsters = Array.from({ length: MONSTER_PARTY_MAX_LENGTH }, () => ({}) as Monster);
    const inventoryInfoPanelStore = useInventoryInfoPanelStore();
    const isActive = new CaptureItemResolver().checkIsActive(ref(item), ref({} as Monster));

    expect(isActive).toBe(false);
    expect(inventoryInfoPanelStore.infoDialogMessage.text).toBe("You have no room in your party! Cannot use Potion.");
  });

  test("allows a capture while the party has one place left", () => {
    expect.hasAssertions();

    const playerStore = usePlayerStore();
    playerStore.player.monsters = Array.from({ length: MONSTER_PARTY_MAX_LENGTH - 1 }, () => ({}) as Monster);
    const isActive = new CaptureItemResolver().checkIsActive(ref(item), ref({} as Monster));

    expect(isActive).toBe(true);
  });
});

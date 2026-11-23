/* oxlint-disable vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type */
// @vitest-environment nuxt
import type { Item } from "#shared/models/dungeons/item/Item";
import type { PhaserEvents } from "#src/models/phaser/PhaserEvents";
import type { TypedEventEmitter } from "@esposter/shared";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { ItemEffectType } from "#shared/models/dungeons/item/ItemEffectType";
import { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { MONSTER_PARTY_MAX_LENGTH } from "#shared/services/dungeons/constants";
import { CaptureItemResolver } from "#src/models/resolvers/dungeons/item/CaptureItemResolver";
import { createSceneWithPlugins } from "#src/services/phaser/createSceneWithPlugins.test";
import { phaserEventEmitter } from "#src/services/phaser/phaserEventEmitter";
import { useBallStore } from "#src/store/dungeons/battle/ball";
import { useInventoryInfoPanelStore } from "#src/store/dungeons/inventory/infoPanel";
import { usePlayerStore } from "#src/store/dungeons/player";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The party lives on the player, and the player store reads the dungeons store, which imports Phaser. Only the party is
// Read here, so the fake holds one
vi.mock("#src/store/dungeons/player", async () => {
  const { reactive } = await import("vue");
  const player = reactive({ monsters: [] as Monster[] });
  return { usePlayerStore: () => ({ player }) };
});
// The capture only reads the party and the info panel, so the monster party's panel store, which loads the dialog and
// With it Phaser, is faked out
vi.mock("#src/store/dungeons/monsterParty/infoPanel", () => ({ useMonsterPartyInfoPanelStore: () => ({}) }));
// The battle and its event emitter load Phaser, which cannot initialise under the test environment. A capture reaches them
// Only once it goes ahead, so these fakes stand in for them
vi.mock("#src/services/dungeons/scene/battle/battleStateMachine", () => ({ battleStateMachine: {} }));
vi.mock("#src/services/phaser/phaserEventEmitter", () => ({
  phaserEventEmitter: { emit: vi.fn<TypedEventEmitter<PhaserEvents>["emit"]>() },
}));

describe(CaptureItemResolver, () => {
  let item: Item;
  let monster: Monster;

  beforeEach(() => {
    item = {
      description: "description",
      effect: { type: ItemEffectType.Capture, value: 0 },
      id: ItemId.Potion,
      quantity: 1,
    };
    monster = new Monster(MonsterKey.Iguanignite);
    const playerStore = usePlayerStore();
    const { player } = storeToRefs(playerStore);
    player.value.monsters = [];
  });

  test("refuses a capture and says why while the party is full", () => {
    expect.hasAssertions();

    const playerStore = usePlayerStore();
    const { player } = storeToRefs(playerStore);
    player.value.monsters = Array.from({ length: MONSTER_PARTY_MAX_LENGTH }, () => monster);
    const inventoryInfoPanelStore = useInventoryInfoPanelStore();
    const { infoDialogMessage } = storeToRefs(inventoryInfoPanelStore);
    const isActive = new CaptureItemResolver().checkIsActive(ref(item), ref(monster));

    expect(isActive).toBe(false);
    expect(infoDialogMessage.value.text).toBe("You have no room in your party! Cannot use Potion.");
  });

  test("allows a capture while the party has one place left", () => {
    expect.hasAssertions();

    const playerStore = usePlayerStore();
    const { player } = storeToRefs(playerStore);
    player.value.monsters = Array.from({ length: MONSTER_PARTY_MAX_LENGTH - 1 }, () => monster);
    const isActive = new CaptureItemResolver().checkIsActive(ref(item), ref(monster));

    expect(isActive).toBe(true);
  });

  test("a capture with a saved ball without a texture field still captures", () => {
    expect.hasAssertions();

    const ballStore = useBallStore();
    const { texture } = storeToRefs(ballStore);
    texture.value = FileKey.UIBallsCosmoBall;
    const scene = createSceneWithPlugins();
    const damagedBallItem = { ...item, id: ItemId.DamagedBall };
    new CaptureItemResolver().handleItem(scene, ref(damagedBallItem), ref(monster));

    const onComplete = vi.mocked(phaserEventEmitter.emit).mock.lastCall?.[4];

    expect(texture.value).toBe(FileKey.UIBallsDamagedBall);
    expect(phaserEventEmitter.emit).toHaveBeenCalledExactlyOnceWith(
      "useItem",
      scene,
      damagedBallItem,
      monster,
      onComplete,
    );
  });
});

import type { ArchiveData } from "#src/models/archive/ArchiveData";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";
import type { OreHit } from "#src/models/gathering/OreHit";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { KitBody } from "#src/models/kit/KitBody";
import type { WorldDrop } from "#src/models/world/WorldDrop";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { GameText } from "genshin-text";
import type { Ref, ShallowRef } from "vue";

import { useGatheringPoints } from "#src/composables/useGatheringPoints";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { openArchiveBook } from "#src/services/archive/openArchiveBook";
import { checkIsGatheringPlaceStanding } from "#src/services/gathering/checkIsGatheringPlaceStanding";
import { GATHERING_CLOCK_INTERVAL_MS } from "#src/services/gathering/constants";
import { OreItemIdBreakPoiseMap } from "#src/services/gathering/OreItemIdBreakPoiseMap";
import { rollOreDropCount } from "#src/services/gathering/rollOreDropCount";
import { strikeOre } from "#src/services/gathering/strikeOre";
import { pickUpDroppedItem } from "#src/services/interaction/pickUpDroppedItem";
import { placeEnemyDrops } from "#src/services/interaction/placeEnemyDrops";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { toItemDefinition } from "#src/services/inventory/toItemDefinition";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { ID_SEPARATOR } from "@esposter/shared";
import { useIntervalFn, useNow } from "@vueuse/core";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// The drops lying in the world and the gathering points, each drawn as a row the character can pick up. A drop or a point
// Taken goes into the bag or the wallet, and what the bag has no room for stays on the ground, so a grant is saved at once
export const useWorldPickups = ({
  archive,
  events,
  gameText,
  getWorldNow,
  inventory,
  nameText,
  serverClockOffsetMs,
  setInventory,
  setWallet,
  wallet,
}: {
  archive: { archiveData: ShallowRef<ArchiveData | undefined>; archiveProgressMap: ShallowRef<ArchiveProgress> };
  events: WorldEvents;
  gameText: GameText;
  getWorldNow: () => Temporal.Instant;
  inventory: Ref<Inventory>;
  nameText: Readonly<Record<string, string>>;
  serverClockOffsetMs: number;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  // The drops lying in the world, which each defeated enemy's are placed among, and how many drops the page has placed,
  // Which numbers the next ones
  const worldDrops = shallowRef<WorldDrop[]>([]);
  let placedDropCount = 0;
  // Mondstadt's gathering points and the items they give, read as the world opens. A point picked is kept with the instant
  // It was picked, and stands again once its respawn has come, read each time the clock is looked at
  const { gatheringItems, gatheringPlaces } = useGatheringPoints();
  const idGatheringItemMap = computed(() => new Map(gatheringItems.value.map((item) => [item.id, item] as const)));
  const gatheringPlaceIdPickedAtMap = shallowRef<ReadonlyMap<string, Temporal.Instant>>(new Map());
  // The broken share of each ore struck and not yet broken, by its point, which the ore breaking takes out
  const oreIdBrokenShareMap = shallowRef<ReadonlyMap<string, number>>(new Map());
  const gatheringClock = useNow({ scheduler: (callback) => useIntervalFn(callback, GATHERING_CLOCK_INTERVAL_MS) });
  // Each drop, named by its item, and each gathering point that stands now, named by its item, each standing on the ground
  // Beneath its point
  const pickUpInteractables = computed<Interactable[]>(() => {
    const drops = worldDrops.value.map(({ id, itemId, position: { x, z } }) => ({
      id,
      kind: InteractionKind.PickUp,
      name: itemId === MORA_ITEM_ID ? gameText[GameTextKey.Mora] : getItemDefinition(itemId, nameText).name,
      position: { x, y: getWorldHeight(x, z), z },
    }));
    const now = Temporal.Instant.fromEpochMilliseconds(gatheringClock.value.getTime() + serverClockOffsetMs);
    // An ore is struck until it breaks rather than picked up, so its points are left out of the pick ups
    const gatherings = gatheringPlaces.value.flatMap(({ id, kind, position: { x, z } }) => {
      const item = idGatheringItemMap.value.get(kind);
      if (
        !item ||
        kind in OreItemIdBreakPoiseMap ||
        !checkIsGatheringPlaceStanding(gatheringPlaceIdPickedAtMap.value.get(id), item.respawn, now)
      )
        return [];
      return [
        {
          id,
          kind: InteractionKind.PickUp,
          name: toItemDefinition(item, nameText).name,
          position: { x, y: getWorldHeight(x, z), z },
        },
      ];
    });
    return [...drops, ...gatherings];
  });
  // A defeated enemy's drops lie where it fell, numbered on from the drops placed before them
  const placeWorldDrops = (enemy: Enemy, enemyDrops: EnemyDrops) => {
    const drops = placeEnemyDrops(enemy, enemyDrops, placedDropCount);
    placedDropCount += drops.length;
    worldDrops.value = [...worldDrops.value, ...drops];
  };
  // The game's hint over the world for a pick up the bag had no room for, cleared by the next pick up that fits
  const bagFullHint = ref("");
  // A pick up takes the drop's Mora or item into the wallet or the bag, and what the bag has no room for stays on the
  // Ground as a smaller drop
  const pickUpWorldDrop = (worldDrop: WorldDrop) => {
    // A volume is taken straight into the Archive, which opens its entry, and never into the bag
    const books = archive.archiveData.value?.sectionEntriesMap[ArchiveSection.Books] ?? [];
    if (books.some(({ materialId }) => materialId === worldDrop.itemId)) {
      archive.archiveProgressMap.value = openArchiveBook(archive.archiveProgressMap.value, books, worldDrop.itemId);
      worldDrops.value = worldDrops.value.filter((drop) => drop !== worldDrop);
      return;
    }
    const pickUp = pickUpDroppedItem(worldDrop, inventory.value, wallet.value, nameText);
    setInventory(pickUp.inventory);
    setWallet(pickUp.wallet);
    bagFullHint.value = pickUp.overflow > 0 ? gameText[GameTextKey.BagFull] : "";
    events.emit("questEvent", { kind: QuestObjectiveKind.Collect, targetId: String(worldDrop.itemId) });
    worldDrops.value =
      pickUp.overflow > 0
        ? worldDrops.value.map((drop) => (drop === worldDrop ? { ...drop, count: pickUp.overflow } : drop))
        : worldDrops.value.filter((drop) => drop !== worldDrop);
  };
  // A gathering point is picked into the bag as one of its item, and is kept as picked only once the bag has taken it
  const pickUpGatheringPlace = (placeId: string) => {
    const place = gatheringPlaces.value.find(({ id }) => id === placeId);
    if (!place) return;
    const item = idGatheringItemMap.value.get(place.kind);
    if (!item) return;
    const addition = addInventoryItem(inventory.value, toItemDefinition(item, nameText), 1);
    setInventory(addition.inventory);
    bagFullHint.value = addition.overflow > 0 ? gameText[GameTextKey.BagFull] : "";
    events.emit("questEvent", { kind: QuestObjectiveKind.Collect, targetId: String(item.id) });
    if (addition.overflow === 0)
      gatheringPlaceIdPickedAtMap.value = new Map([...gatheringPlaceIdPickedAtMap.value, [placeId, getWorldNow()]]);
  };
  // The ores a character's hit reaches are struck: each standing ore in the hit's area takes the hit's share, and one that
  // Breaks drops its pieces where it lies and is kept as picked at the instant it broke
  const strikeGatheringOres = (body: KitBody, hit: OreHit, random: () => number) => {
    const now = getWorldNow();
    for (const { id, kind, position } of gatheringPlaces.value) {
      const requirement = OreItemIdBreakPoiseMap[kind];
      const item = idGatheringItemMap.value.get(kind);
      if (
        !requirement ||
        !item ||
        !checkIsGatheringPlaceStanding(gatheringPlaceIdPickedAtMap.value.get(id), item.respawn, now) ||
        !checkIsInAttackArea(hit.hitArea, body, { position })
      )
        continue;
      const brokenShare = strikeOre(oreIdBrokenShareMap.value.get(id) ?? 0, hit, requirement);
      if (brokenShare < 1) {
        oreIdBrokenShareMap.value = new Map([...oreIdBrokenShareMap.value, [id, brokenShare]]);
        continue;
      }
      const pieces = Array.from({ length: rollOreDropCount(random) }, (_value, index) => ({
        count: 1,
        id: [id, now.epochMilliseconds, index].join(ID_SEPARATOR),
        itemId: kind,
        position: { x: position.x, z: position.z },
      }));
      worldDrops.value = [...worldDrops.value, ...pieces];
      gatheringPlaceIdPickedAtMap.value = new Map([...gatheringPlaceIdPickedAtMap.value, [id, now]]);
      oreIdBrokenShareMap.value = new Map([...oreIdBrokenShareMap.value].filter(([oreId]) => oreId !== id));
    }
  };
  return {
    bagFullHint,
    pickUpGatheringPlace,
    pickUpInteractables,
    pickUpWorldDrop,
    placeWorldDrops,
    strikeGatheringOres,
    worldDrops,
  };
};

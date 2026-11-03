import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { GatheringItem } from "#src/models/gathering/GatheringItem";
import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";
import type { OreHit } from "#src/models/gathering/OreHit";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { KitBody } from "#src/models/kit/KitBody";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { MaterialSourcePlace } from "#src/models/wildlife/MaterialSourcePlace";
import type { WorldDrop } from "#src/models/world/WorldDrop";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { checkIsGatheringPlaceStanding } from "#src/services/gathering/checkIsGatheringPlaceStanding";
import { OreItemIdBreakPoiseMap } from "#src/services/gathering/OreItemIdBreakPoiseMap";
import { readGatheringItems } from "#src/services/gathering/readGatheringItems";
import { readMondstadtGatheringPlaces } from "#src/services/gathering/readMondstadtGatheringPlaces";
import { rollOreDropCount } from "#src/services/gathering/rollOreDropCount";
import { strikeOre } from "#src/services/gathering/strikeOre";
import { pickUpDroppedItem } from "#src/services/interaction/pickUpDroppedItem";
import { placeDroppedItems } from "#src/services/interaction/placeDroppedItems";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { toItemDefinition } from "#src/services/inventory/toItemDefinition";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { pickUpMaterialSource } from "#src/services/wildlife/pickUpMaterialSource";
import { readMondstadtMaterialSourcePlaces } from "#src/services/wildlife/readMondstadtMaterialSourcePlaces";
import { useWorldArchiveStore } from "#src/store/archive";
import { useWorldGroundStore } from "#src/store/ground";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";

// The drops lying in the world and the gathering points, each drawn as a row the character can pick up. A drop or a point
// Taken goes into the bag or the wallet, and what the bag has no room for stays on the ground, so a grant is saved at once.
// The session starts it with the tables a drop is named from, and stops it as it unmounts
export const useWorldPickupsStore = defineStore("world/pickups", () => {
  const worldArchiveStore = useWorldArchiveStore();
  const worldGroundStore = useWorldGroundStore();
  const worldSessionStore = useWorldSessionStore();
  const { events, getWorldNow, setInventory, setWallet } = worldSessionStore;
  let reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry> = new Map();
  let weaponDataMap: ReadonlyMap<number, WeaponData> = new Map();
  // The drops lying in the world, which each defeated enemy's are placed among, and how many drops the page has placed,
  // Which numbers the next ones
  const worldDrops = shallowRef<WorldDrop[]>([]);
  let placedDropCount = 0;
  // Mondstadt's gathering points and the items they give, read as the world opens. A point picked is kept with the instant
  // It was picked, and stands again once its respawn has come, read each time the clock is looked at. A load that fails is
  // Logged and left off, so no point is offered rather than a wrong one
  const gatheringItems = shallowRef<GatheringItem[]>([]);
  const gatheringPlaces = shallowRef<GatheringPlace[]>([]);
  const idGatheringItemMap = computed(() => new Map(gatheringItems.value.map((item) => [item.id, item] as const)));
  const gatheringPlaceIdPickedAtMap = shallowRef<ReadonlyMap<string, Temporal.Instant>>(new Map());
  // Mondstadt's material sources, the crystalflies picked up whole, fetched as the world opens, left off the same way
  const materialSources = shallowRef<MaterialSourcePlace[]>([]);
  // The broken share of each ore struck and not yet broken, by its point, which the ore breaking takes out
  const oreIdBrokenShareMap = shallowRef<ReadonlyMap<string, number>>(new Map());
  // Each drop, named by its item, and each gathering point that stands now, named by its item, each standing on the ground
  // Beneath its point
  const pickUpInteractables = computed<Interactable[]>(() => {
    const drops = worldDrops.value.map(({ id, itemId, position: { x, z } }) => ({
      id,
      kind: InteractionKind.PickUp,
      name:
        itemId === MORA_ITEM_ID
          ? worldSessionStore.gameText[GameTextKey.Mora]
          : getDroppedItemDefinition(
              itemId,
              worldSessionStore.nameText,
              weaponDataMap,
              worldSessionStore.materialDataMap,
              reliquaryPieceEntryMap,
            ).name,
      position: { x, y: worldGroundStore.getGroundHeight(x, z), z },
    }));
    const now = worldSessionStore.worldNow;
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
          name: toItemDefinition(item, worldSessionStore.nameText).name,
          position: { x, y: worldGroundStore.getGroundHeight(x, z), z },
        },
      ];
    });
    const sources = materialSources.value.map(({ id, kind, position: { x, z } }) => ({
      id,
      kind: InteractionKind.PickUp,
      name: getItemDefinition(kind, worldSessionStore.nameText, worldSessionStore.materialDataMap).name,
      position: { x, y: worldGroundStore.getGroundHeight(x, z), z },
    }));
    return [...drops, ...gatherings, ...sources];
  });
  // The items a source drops lie at its point, numbered on from the drops placed before them
  const placeWorldDrops = (source: Pick<WorldDrop, "id" | "position">, droppedItems: DroppedItem[]) => {
    const drops = placeDroppedItems(source, droppedItems, placedDropCount);
    placedDropCount += drops.length;
    worldDrops.value = [...worldDrops.value, ...drops];
  };
  // The game's hint over the world for a pick up the bag had no room for, cleared by the next pick up that fits
  const bagFullHint = ref("");
  // A pick up takes the drop's Mora or item into the wallet or the bag, and what the bag has no room for stays on the
  // Ground as a smaller drop. Mora picked up is told to the team's kits, which an artifact set answers
  const pickUpWorldDrop = (worldDrop: WorldDrop) => {
    // A volume is taken straight into the Archive, which opens its entry, and never into the bag
    if (worldArchiveStore.takeBook(worldDrop.itemId)) {
      worldDrops.value = worldDrops.value.filter((drop) => drop !== worldDrop);
      return;
    }
    const pickUp = pickUpDroppedItem(
      worldDrop,
      worldSessionStore.inventory,
      worldSessionStore.wallet,
      worldSessionStore.nameText,
      worldSessionStore.materialDataMap,
      reliquaryPieceEntryMap,
      weaponDataMap,
    );
    setInventory(pickUp.inventory);
    setWallet(pickUp.wallet);
    bagFullHint.value = pickUp.overflow > 0 ? worldSessionStore.gameText[GameTextKey.BagFull] : "";
    if (worldDrop.itemId === MORA_ITEM_ID) events.emit("pickUpMora");
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
    const addition = addInventoryItem(
      worldSessionStore.inventory,
      toItemDefinition(item, worldSessionStore.nameText),
      1,
    );
    setInventory(addition.inventory);
    bagFullHint.value = addition.overflow > 0 ? worldSessionStore.gameText[GameTextKey.BagFull] : "";
    events.emit("questEvent", { kind: QuestObjectiveKind.Collect, targetId: String(item.id) });
    if (addition.overflow === 0) {
      events.emit("gatheringPickedUp", String(item.id));
      gatheringPlaceIdPickedAtMap.value = new Map([...gatheringPlaceIdPickedAtMap.value, [placeId, getWorldNow()]]);
    }
  };
  // A material source is picked into the bag as its item and taken out of the world, which keeps it where it lies when the bag
  // Has no room for it
  const pickUpMaterialSourcePlace = (placeId: string) => {
    const pickUp = pickUpMaterialSource(
      materialSources.value,
      placeId,
      worldSessionStore.inventory,
      worldSessionStore.nameText,
      worldSessionStore.materialDataMap,
    );
    setInventory(pickUp.inventory);
    bagFullHint.value = pickUp.overflow > 0 ? worldSessionStore.gameText[GameTextKey.BagFull] : "";
    materialSources.value = pickUp.materialSources;
  };
  // An ore's break: its drops are placed where it stood and counted as obtained. The gathering ores and the mining
  // Outcrops break alike
  const breakOre = ({ id, kind, position }: Pick<GatheringPlace, "id" | "kind" | "position">, random: () => number) => {
    const dropCount = rollOreDropCount(random);
    placeWorldDrops(
      { id, position },
      Array.from({ length: dropCount }, () => ({ count: 1, itemId: kind })),
    );
    events.emit("achievementEvents", [
      { kind: AchievementEventKind.MaterialObtained, quantity: dropCount, targetId: String(kind) },
    ]);
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
      breakOre({ id, kind, position }, random);
      gatheringPlaceIdPickedAtMap.value = new Map([...gatheringPlaceIdPickedAtMap.value, [id, now]]);
      oreIdBrokenShareMap.value = new Map([...oreIdBrokenShareMap.value].filter(([oreId]) => oreId !== id));
    }
  };
  const start = (tables: {
    reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>;
    weaponDataMap: ReadonlyMap<number, WeaponData>;
  }) => {
    ({ reliquaryPieceEntryMap, weaponDataMap } = tables);
    getSynchronizedFunction(() =>
      getResultAsync(() =>
        Promise.all([
          readMondstadtGatheringPlaces(worldSessionStore.gameDataBaseUrl),
          readGatheringItems(worldSessionStore.gameDataBaseUrl),
        ]),
      ).match(
        ([places, items]) => {
          gatheringItems.value = items;
          gatheringPlaces.value = places;
        },
        (error) => {
          console.error(error);
        },
      ),
    )();
    getSynchronizedFunction(() =>
      getResultAsync(() => readMondstadtMaterialSourcePlaces(worldSessionStore.gameDataBaseUrl)).match(
        (places) => {
          materialSources.value = places;
        },
        (error) => {
          console.error(error);
        },
      ),
    )();
  };
  const stop = () => {
    bagFullHint.value = "";
    gatheringItems.value = [];
    gatheringPlaceIdPickedAtMap.value = new Map();
    gatheringPlaces.value = [];
    materialSources.value = [];
    oreIdBrokenShareMap.value = new Map();
    placedDropCount = 0;
    worldDrops.value = [];
  };
  return {
    bagFullHint,
    breakOre,
    materialSources,
    pickUpGatheringPlace,
    pickUpInteractables,
    pickUpMaterialSourcePlace,
    pickUpWorldDrop,
    placeWorldDrops,
    start,
    stop,
    strikeGatheringOres,
    worldDrops,
  };
});

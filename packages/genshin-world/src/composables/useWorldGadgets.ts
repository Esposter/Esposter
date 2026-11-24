import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { CooldownGroupReadyAtMap } from "#src/models/gadget/CooldownGroupReadyAtMap";
import type { GadgetRow } from "#src/models/gadget/GadgetRow";
import type { GroundPoint } from "genshin-engine";
import type { Ref } from "vue";

import { checkIsQuickSwapOpen } from "#src/services/gadget/checkIsQuickSwapOpen";
import { computeDetectorTarget } from "#src/services/gadget/computeDetectorTarget";
import { getGadgetCooldownSeconds } from "#src/services/gadget/getGadgetCooldownSeconds";
import { quickUseGadget } from "#src/services/gadget/quickUseGadget";
import { readGadgetRows } from "#src/services/gadget/readGadgetRows";
import { stepQuickUseHeldSeconds } from "#src/services/gadget/stepQuickUseHeldSeconds";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { storeToRefs } from "pinia";
import { computed, shallowRef } from "vue";

// The widget config's gadgets, fetched by their key as the world opens, and the gadget equipped to the quick-use slot,
// Which Z uses once its cooldown group is ready. A load that fails is logged and left off, so no gadget is used rather
// Than a wrong one. A used detector's target is read from the chests of the region it names, which the world holds once
// The region is in reach
export const useWorldGadgets = ({
  getRegionChestPlaces,
  openedChestIds,
}: {
  getRegionChestPlaces: (regionId: string) => readonly ChestPlace[];
  openedChestIds: Readonly<Ref<ReadonlySet<string>>>;
}) => {
  const worldSessionStore = useWorldSessionStore();
  const { inventory } = storeToRefs(worldSessionStore);
  const gadgetRows = shallowRef<GadgetRow[]>([]);
  getSynchronizedFunction(() =>
    getResultAsync(() => readGadgetRows(worldSessionStore.gameDataBaseUrl)).match(
      (rows) => {
        gadgetRows.value = rows;
      },
      (error) => {
        console.error(error);
      },
    ),
  )();
  const cooldownGroupReadyAtMap = shallowRef<CooldownGroupReadyAtMap>(new Map());
  const equippedGadget = computed(() => gadgetRows.value.find(({ id }) => id === inventory.value.equippedGadgetItemId));
  // Z uses the equipped gadget at `now`, which starts its group's cooldown when it is used. The gadget used is
  // Returned, none when no gadget is equipped or its cooldown refuses the use
  const quickUseEquippedGadget = (now: Temporal.Instant): GadgetRow | undefined => {
    const gadget = equippedGadget.value;
    if (!gadget) return undefined;
    const nextCooldownGroupReadyAtMap = quickUseGadget(cooldownGroupReadyAtMap.value, gadget, now);
    if (!nextCooldownGroupReadyAtMap) return undefined;
    cooldownGroupReadyAtMap.value = nextCooldownGroupReadyAtMap;
    return gadget;
  };
  // The seconds left of the equipped gadget's cooldown at `now`, none when no gadget is equipped
  const getEquippedGadgetCooldown = (now: Temporal.Instant) =>
    equippedGadget.value ? getGadgetCooldownSeconds(cooldownGroupReadyAtMap.value, equippedGadget.value, now) : 0;
  // Z's hold, read each frame: a press released before the quick swap's hold uses the equipped gadget, and a longer
  // Hold opens the quick swap instead. A frame outside the world drops the hold, so a release there is never a use
  let quickUseHeldSeconds = 0;
  const isQuickSwapOpen = shallowRef(false);
  // The chest the last used gadget points to, from the position it was used at, the pointer the HUD draws once its look
  // Is read. A use that points to no box, as any gadget but a compass does, clears it
  const detectorTarget = shallowRef<ChestPlace>();
  const stepQuickUse = ({
    isActive,
    isHeld,
    now,
    position,
    seconds,
  }: {
    isActive: boolean;
    isHeld: boolean;
    now: Temporal.Instant;
    position: GroundPoint;
    seconds: number;
  }): GadgetRow | undefined => {
    const previousHeldSeconds = quickUseHeldSeconds;
    quickUseHeldSeconds = isActive ? stepQuickUseHeldSeconds(previousHeldSeconds, isHeld, seconds) : 0;
    let usedGadget: GadgetRow | undefined;
    if (isActive && !isHeld && previousHeldSeconds > 0 && !checkIsQuickSwapOpen(previousHeldSeconds))
      usedGadget = quickUseEquippedGadget(now);
    if (usedGadget)
      detectorTarget.value = computeDetectorTarget(
        usedGadget,
        getRegionChestPlaces(usedGadget.region),
        openedChestIds.value,
        position,
      );
    isQuickSwapOpen.value = checkIsQuickSwapOpen(quickUseHeldSeconds);
    return usedGadget;
  };
  return { detectorTarget, equippedGadget, gadgetRows, getEquippedGadgetCooldown, isQuickSwapOpen, stepQuickUse };
};

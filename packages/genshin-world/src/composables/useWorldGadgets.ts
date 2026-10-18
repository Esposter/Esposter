import type { CooldownGroupReadyAtMap } from "#src/models/gadget/CooldownGroupReadyAtMap";
import type { GadgetRow } from "#src/models/gadget/GadgetRow";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Ref } from "vue";

import { getGadgetCooldownSeconds } from "#src/services/gadget/getGadgetCooldownSeconds";
import { quickUseGadget } from "#src/services/gadget/quickUseGadget";
import { readGadgetRows } from "#src/services/gadget/readGadgetRows";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The widget config's gadgets, fetched by their key as the world opens, and the gadget equipped to the quick-use slot,
// Which Z uses once its cooldown group is ready. A load that fails is logged and left off, so no gadget is used rather
// Than a wrong one
export const useWorldGadgets = ({
  gameDataBaseUrl,
  inventory,
}: {
  gameDataBaseUrl: string;
  inventory: Ref<Inventory>;
}) => {
  const gadgetRows = shallowRef<GadgetRow[]>([]);
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readGadgetRows(gameDataBaseUrl)).match(
    (rows) => {
      gadgetRows.value = rows;
    },
    (error) => {
      console.error(error);
    },
  );
  const cooldownGroupReadyAtMap = shallowRef<CooldownGroupReadyAtMap>(new Map());
  const equippedGadget = computed(() => gadgetRows.value.find(({ id }) => id === inventory.value.equippedGadgetItemId));
  // Z uses the equipped gadget at `now`, which starts its group's cooldown when it is used
  const quickUseEquippedGadget = (now: Temporal.Instant) => {
    if (equippedGadget.value)
      cooldownGroupReadyAtMap.value = quickUseGadget(cooldownGroupReadyAtMap.value, equippedGadget.value, now);
  };
  // The seconds left of the equipped gadget's cooldown at `now`, none when no gadget is equipped
  const getEquippedGadgetCooldown = (now: Temporal.Instant) =>
    equippedGadget.value ? getGadgetCooldownSeconds(cooldownGroupReadyAtMap.value, equippedGadget.value, now) : 0;
  return { equippedGadget, gadgetRows, getEquippedGadgetCooldown, quickUseEquippedGadget };
};

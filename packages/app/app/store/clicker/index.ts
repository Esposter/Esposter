import type { ClickerItemProperties } from "@/models/clicker/ClickerItemProperties";

import { Clicker } from "#shared/models/clicker/data/Clicker";
import { clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";
import { getClickerColorMap } from "@/services/clicker/properties/getClickerColorMap";
import { ClickerIconComponentMap } from "@/services/clicker/properties/ClickerIconComponentMap";
import { ClickerNameMap } from "@/services/clicker/properties/ClickerNameMap";
import { ClickerPluralNameMap } from "@/services/clicker/properties/ClickerPluralNameMap";
import { toClickerSave } from "@/services/clicker/save/toClickerSave";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useColorsStore } from "@/store/colors";

export const useClickerStore = defineStore("clicker", () => {
  const { $trpc } = useNuxtApp();
  const colorsStore = useColorsStore();
  const clicker = ref(new Clicker());
  // Persist ids and counters only (the `ClickerSave` shape) so content rebalances reach existing saves
  const { save: saveClicker, setState: setClicker } = useSave(clicker, {
    auth: { save: $trpc.clicker.saveClicker.mutate },
    toSave: toClickerSave,
    unauth: { key: LocalStorageKey.ClickerStore, schema: clickerSaveSchema },
  });
  const clickerItemProperties = computed<ClickerItemProperties>(() => ({
    color: getClickerColorMap({ error: colorsStore.error, info: colorsStore.info, primary: colorsStore.primary })[
      clicker.value.type
    ],
    iconComponent: ClickerIconComponentMap[clicker.value.type],
    name: ClickerNameMap[clicker.value.type],
    pluralName: ClickerPluralNameMap[clicker.value.type],
  }));
  return { clicker, clickerItemProperties, saveClicker, setClicker };
});

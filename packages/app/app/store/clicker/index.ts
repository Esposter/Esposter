import type { ClickerItemProperties } from "#shared/models/clicker/ClickerItemProperties";

import { Clicker } from "#shared/models/clicker/data/Clicker";
import { clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";
import { getColorMap } from "@/services/clicker/properties/getColorMap";
import { IconComponentMap } from "@/services/clicker/properties/IconComponentMap";
import { NameMap } from "@/services/clicker/properties/NameMap";
import { PluralNameMap } from "@/services/clicker/properties/PluralNameMap";
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
  const clickerItemColor = computed(
    () =>
      getColorMap({ error: colorsStore.error, info: colorsStore.info, primary: colorsStore.primary })[
        clicker.value.type
      ],
  );
  const clickerItemProperties = computed<ClickerItemProperties>(() => ({
    color: clickerItemColor.value,
    iconComponent: IconComponentMap[clicker.value.type],
    name: NameMap[clicker.value.type],
    pluralName: PluralNameMap[clicker.value.type],
  }));
  return { clicker, clickerItemProperties, saveClicker, setClicker };
});

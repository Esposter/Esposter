import type { ClickerItemProperties } from "#src/models/clicker/ClickerItemProperties";

import { clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";
import { createClicker } from "#src/services/clicker/createClicker";
import { ClickerColorMap } from "#src/services/clicker/properties/ClickerColorMap";
import { ClickerIconComponentMap } from "#src/services/clicker/properties/ClickerIconComponentMap";
import { ClickerNameMap } from "#src/services/clicker/properties/ClickerNameMap";
import { ClickerPluralNameMap } from "#src/services/clicker/properties/ClickerPluralNameMap";
import { toClickerSave } from "#src/services/clicker/save/toClickerSave";
import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";

export const useClickerStore = defineStore("clicker", () => {
  const { $trpc } = useNuxtApp();
  const clicker = ref(createClicker());
  // Persist ids and counters only (the `ClickerSave` shape) so content rebalances reach existing saves
  const { save: saveClicker, setState: setClicker } = useSave(clicker, {
    auth: { save: (clickerSave, etag) => $trpc.clicker.saveClicker.mutate({ data: clickerSave, etag }) },
    toSave: toClickerSave,
    unauth: { key: LocalStorageKey.ClickerStore, schema: clickerSaveSchema },
  });
  const clickerItemProperties = computed<ClickerItemProperties>(() => ({
    color: ClickerColorMap[clicker.value.type],
    iconComponent: ClickerIconComponentMap[clicker.value.type],
    name: ClickerNameMap[clicker.value.type],
    pluralName: ClickerPluralNameMap[clicker.value.type],
  }));
  return { clicker, clickerItemProperties, saveClicker, setClicker };
});

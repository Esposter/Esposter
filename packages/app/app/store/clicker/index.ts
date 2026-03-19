import type { ClickerItemProperties } from "#shared/models/clicker/ClickerItemProperties";

import { Clicker, clickerSchema } from "#shared/models/clicker/data/Clicker";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";
import { getColorMap } from "@/services/clicker/properties/getColorMap";
import { IconComponentMap } from "@/services/clicker/properties/IconComponentMap";
import { NameMap } from "@/services/clicker/properties/NameMap";
import { PluralNameMap } from "@/services/clicker/properties/PluralNameMap";
import { useColorsStore } from "@/store/colors";

export const useClickerStore = defineStore("clicker", () => {
  const { $trpc } = useNuxtApp();
  const colorsStore = useColorsStore();
  const clicker = ref(new Clicker());
  const saveClicker = useSave(clicker, {
    auth: { save: $trpc.clicker.saveClicker.mutate },
    unauth: { key: CLICKER_LOCAL_STORAGE_KEY, schema: clickerSchema },
  });
  const clickerItemColor = computed(() => getColorMap(colorsStore)[clicker.value.type]);
  const clickerItemProperties = computed<ClickerItemProperties>(() => ({
    color: clickerItemColor.value,
    iconComponent: IconComponentMap[clicker.value.type],
    name: NameMap[clicker.value.type],
    pluralName: PluralNameMap[clicker.value.type],
  }));
  return { clicker, clickerItemProperties, saveClicker };
});

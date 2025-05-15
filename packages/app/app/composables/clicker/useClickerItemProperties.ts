import type { ClickerItemProperties } from "#shared/models/clicker/ClickerItemProperties";

import { IconComponentMap } from "@/services/clicker/properties/IconComponentMap";
import { NameMap } from "@/services/clicker/properties/NameMap";
import { PluralNameMap } from "@/services/clicker/properties/PluralNameMap";
import { useClickerStore } from "@/store/clicker";

export const useClickerItemProperties = () => {
  const clickerStore = useClickerStore();
  const { clicker } = storeToRefs(clickerStore);
  const clickerItemColor = useClickerItemColor();
  const clickerItemProperties = computed<ClickerItemProperties>(() => ({
    color: clickerItemColor.value,
    iconComponent: IconComponentMap[clicker.value.type],
    name: NameMap[clicker.value.type],
    pluralName: PluralNameMap[clicker.value.type],
  }));
  return clickerItemProperties;
};

import type { Extension } from "@codemirror/state";

import { useThemeModeStore } from "@/store/ui/themeMode";
import { oneDark } from "@codemirror/theme-one-dark";

export const useExtensions = (baseExtensions: MaybeRef<Extension[]>) => {
  const themeModeStore = useThemeModeStore();
  const { isDark } = storeToRefs(themeModeStore);
  return computed(() => {
    const baseExtensionsValue = unref(baseExtensions);
    return isDark.value ? [...baseExtensionsValue, oneDark] : baseExtensionsValue;
  });
};

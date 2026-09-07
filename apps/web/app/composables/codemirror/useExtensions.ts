import type { Extension } from "@codemirror/state";

import { oneDark } from "@codemirror/theme-one-dark";

export const useExtensions = (baseExtensions: MaybeRef<Extension[]>) => {
  const isDark = useIsDark();
  return computed(() => {
    const baseExtensionsValue = unref(baseExtensions);
    return isDark.value ? [...baseExtensionsValue, oneDark] : baseExtensionsValue;
  });
};

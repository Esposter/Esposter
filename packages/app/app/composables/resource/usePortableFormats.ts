import type { Resource } from "@esposter/db-schema";

import { hasCapability } from "#shared/services/resource/hasCapability";
import { PortableFormatMap } from "@/services/resource/PortableFormatMap";

// Callers only render this for portable types, so the guard also narrows the map key
export const usePortableFormats = (resource: MaybeRefOrGetter<Resource>) => {
  const formats = computed(() => {
    const resourceValue = toValue(resource);
    return hasCapability(resourceValue.type, "portable") ? PortableFormatMap[resourceValue.type] : [];
  });
  const exportFormats = computed(() => formats.value.filter(({ export: exportFormat }) => exportFormat));
  const importFormats = computed(() => formats.value.filter(({ import: importFormat }) => importFormat));
  return { exportFormats, importFormats };
};

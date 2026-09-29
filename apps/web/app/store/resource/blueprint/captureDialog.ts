import type { ResourceInResource } from "@esposter/db-schema";

// The resources a Save-as-blueprint command targets — the singleton CaptureDialog mounts while non-empty.
// A per-service dialog store so the bulk toolbar and the row menu drive one dialog instance, never per-item
export const useBlueprintCaptureDialogStore = defineStore("resource/blueprint/captureDialog", () => {
  const captureIds = ref<ResourceInResource["id"][]>([]);
  return { captureIds };
});

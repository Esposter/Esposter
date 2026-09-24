// @unocss-include
import type { ResourceSaveStateDefinition } from "@/models/resource/ResourceSaveStateDefinition";

import { ResourceSaveState } from "@/models/resource/ResourceSaveState";

// What each state looks like beside the resource's title. Each has a glyph of its own, so no state is told apart by
// Colour alone, and the two states with no colour are the two that need nothing from the owner
export const ResourceSaveStateDefinitionMap = {
  [ResourceSaveState.Failed]: { colorClass: "text-error", icon: "i-pixelarticons:warning-box", title: "Not saved" },
  [ResourceSaveState.Saved]: { icon: "i-pixelarticons:cloud-done", title: "Saved" },
  [ResourceSaveState.Saving]: { icon: "i-pixelarticons:cloud-upload", title: "Saving…" },
  [ResourceSaveState.Stale]: {
    colorClass: "text-warning",
    icon: "i-pixelarticons:cloud-download",
    title: "Out of date",
  },
} as const satisfies Record<ResourceSaveState, ResourceSaveStateDefinition>;

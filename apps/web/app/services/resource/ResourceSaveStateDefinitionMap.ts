import type { ResourceSaveStateDefinition } from "@/models/resource/ResourceSaveStateDefinition";

import { ResourceSaveState } from "@/models/resource/ResourceSaveState";

// What each state looks like in the toolbar. The colour rides the icon rather than the text, because Vuetify
// Resolves it at runtime where a UnoCSS class built from a state name is a class the scanner never sees — and
// The two states with no colour are the two that need nothing from the owner
export const ResourceSaveStateDefinitionMap = {
  [ResourceSaveState.Failed]: { color: "error", icon: "mdi-cloud-alert-outline", title: "Not saved" },
  [ResourceSaveState.Saved]: { icon: "mdi-cloud-check-outline", title: "Saved" },
  [ResourceSaveState.Saving]: { icon: "mdi-cloud-sync-outline", title: "Saving…" },
  [ResourceSaveState.Stale]: { color: "warning", icon: "mdi-cloud-refresh-outline", title: "Out of date" },
} as const satisfies Record<ResourceSaveState, ResourceSaveStateDefinition>;

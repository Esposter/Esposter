// @unocss-include
import type { ResourceSaveStateDefinition } from "@/models/resource/ResourceSaveStateDefinition";

import { ResourceSaveState } from "@/models/resource/ResourceSaveState";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// What each state looks like beside the resource's title. Each has a glyph of its own, so no state is told apart by
// Colour alone, and the two states with no colour are the two that need nothing from the owner
export const ResourceSaveStateDefinitionMap = {
  [ResourceSaveState.Failed]: { colorClass: "text-error", meaning: UiIconMeaning.Warning, title: "Not saved" },
  [ResourceSaveState.Saved]: { meaning: UiIconMeaning.Saved, title: "Saved" },
  [ResourceSaveState.Saving]: { meaning: UiIconMeaning.Saving, title: "Saving…" },
  [ResourceSaveState.Stale]: { colorClass: "text-warning", meaning: UiIconMeaning.OutOfDate, title: "Out of date" },
} as const satisfies Record<ResourceSaveState, ResourceSaveStateDefinition>;

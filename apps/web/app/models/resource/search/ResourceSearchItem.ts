import type { ResourceSearchGroup } from "#src/models/resource/search/ResourceSearchGroup";
import type { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import type { RouteLocationRaw } from "vue-router";

// A Services row can be created from as well as opened, which the palette offers as a row of its own. Its mark is a
// Meaning where one names it, and a glyph where a resource type still carries one
export type ResourceSearchItem = {
  createTo?: string;
  group: ResourceSearchGroup;
  id: string;
  subtitle?: string;
  title: string;
  to: RouteLocationRaw;
} & ({ icon: string; meaning?: never } | { icon?: never; meaning: UiIconMeaning });

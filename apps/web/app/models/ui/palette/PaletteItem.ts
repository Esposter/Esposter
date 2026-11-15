import type { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

export interface PaletteItem {
  icon: UiIconMeaning;
  // The editor's own name for the kind, which a click inserts and a drag carries
  kind: string;
  title: string;
}

import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export interface PaletteItem {
  icon: UiIconMeaning;
  // The editor's own name for the kind, which a click inserts and a drag carries
  kind: string;
  title: string;
}

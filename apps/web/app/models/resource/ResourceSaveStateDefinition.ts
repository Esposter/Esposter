// What a save state looks like beside the resource's title. Why two of the four carry no colour is on
// `ResourceSaveStateDefinitionMap`, which is where those choices are made
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export interface ResourceSaveStateDefinition {
  // A colour utility written whole, so the scanner generates it
  colorClass?: string;
  meaning: UiIconMeaning;
  title: string;
}

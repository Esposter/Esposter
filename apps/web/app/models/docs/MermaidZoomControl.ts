import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export interface MermaidZoomControl {
  label: string;
  meaning: UiIconMeaning;
  onClick: () => void;
}

import type { UiStatus } from "@/models/ui/UiStatus";

export interface Alert {
  // A whole icon class drawn in place of the status's own mark
  icon?: string;
  id: string;
  text: string;
  type: UiStatus;
}

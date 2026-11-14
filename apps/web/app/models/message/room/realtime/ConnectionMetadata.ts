import type { UiStatus } from "@/models/ui/UiStatus";

// How a call's connection or its quality reads: its mark, its name, and the status it is drawn in where it has one
export interface ConnectionMetadata {
  icon: string;
  status?: UiStatus;
  title: string;
}

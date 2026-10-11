import type { SlotAdmission } from "#src/models/buildCache/SlotAdmission";

export interface CanAdmitOptions {
  admission?: SlotAdmission;
  freeMemory: number;
  isProcessAlive: (pid: number) => boolean;
  now: number;
  totalMemory: number;
}

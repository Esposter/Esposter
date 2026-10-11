import type { SlotAdmission } from "#src/models/buildCache/SlotAdmission";

export interface CanAdmitOptions {
  admission: SlotAdmission | undefined;
  freeMemory: number;
  isProcessAlive: (pid: number) => boolean;
  now: number;
  totalMemory: number;
}

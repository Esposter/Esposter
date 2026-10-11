// The last run admitted to a slot: its admission time in seconds and its process, the record the shell gate also reads
export interface SlotAdmission {
  admittedAt: number;
  admittedPid: number;
}

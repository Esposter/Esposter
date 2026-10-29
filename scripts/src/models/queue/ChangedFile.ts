import type { ChangeStatus } from "#src/models/queue/ChangeStatus";

export interface ChangedFile {
  path: string;
  status: ChangeStatus;
}

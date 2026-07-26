import type { FileSasEntity } from "@esposter/db-schema";

// The write target plus the signed proof that this member is the one it was minted for. The composer hands the
// Token back to reclaim an upload it threw away — the only delete with no persisted entity to authorize against
export interface MessageFileSasEntity extends FileSasEntity {
  token: string;
}

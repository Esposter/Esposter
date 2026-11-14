import type { IdMap } from "#src/models/cutover/IdMap";
import type { TableParents } from "#src/models/cutover/TableParents";

// The room verify: the functions Worker that holds the rooms' objects and its secret, the
// Azure connection, and the ids and parents the copy wrote with
export interface VerifyRoomMessagesOptions {
  connectionString: string;
  functionsUrl: string;
  idMap: IdMap;
  parents: TableParents;
  secret: string;
}

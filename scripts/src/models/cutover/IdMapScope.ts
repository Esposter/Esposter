import type { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";

import { INVITE_CODE_SCOPE, MESSAGE_NUMBER_SCOPE, POSTGRES_ID_MAP_SCOPE } from "#src/services/cutover/constants";

// The stores the id map keeps apart: one per Azure table of entities, the Postgres rows, the invite codes, and the message numbers of every room
export type IdMapScope =
  | LegacyAzureTable
  | typeof INVITE_CODE_SCOPE
  | typeof MESSAGE_NUMBER_SCOPE
  | typeof POSTGRES_ID_MAP_SCOPE;

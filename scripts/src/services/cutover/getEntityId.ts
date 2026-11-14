import { getUuidV5 } from "#src/services/cutover/getUuidV5";
import { ID_SEPARATOR } from "@esposter/shared";

// The one namespace every migrated Azure row's id is derived under. Fixed for good: changing it changes every id, and so
// every reference to one, so it is never regenerated
export const ENTITY_ID_NAMESPACE = "3f9c2a7e-6b1d-5e4f-8a2c-9d0e1f2a3b4c";

// The id of the typed row an Azure entity becomes: derived from its partition and row key, so a reference to another
// entity (a reply, a forward, a pin) recomputes it without a lookup table
export const getEntityId = (partitionKey: string, rowKey: string): string =>
  getUuidV5(ENTITY_ID_NAMESPACE, `${partitionKey}${ID_SEPARATOR}${rowKey}`);

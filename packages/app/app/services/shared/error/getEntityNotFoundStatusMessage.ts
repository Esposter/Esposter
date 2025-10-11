import type { EntityTypeKey } from "@esposter/db-schema";

export const getEntityNotFoundStatusMessage = (entityTypeKey: EntityTypeKey, id?: string) =>
  `${entityTypeKey} is not found${id ? ` for id: ${id}` : ""}`;

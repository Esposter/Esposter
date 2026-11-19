import type { EntityTypeKey } from "@esposter/db-schema";

// The 404 a page or composable throws for an entity it cannot find. The message names the entity's type and, when known,
// Its id, and the hint, when given, says where else the reader may have meant to go
export const createEntityNotFoundError = (entityTypeKey: EntityTypeKey, id?: string, hint?: string) =>
  createError({
    status: 404,
    statusText: `${entityTypeKey} is not found${id ? ` for id: ${id}` : ""}${hint ? `, ${hint}` : ""}`,
  });

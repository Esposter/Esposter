import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";

export const getEntityNotFoundStatusMessage = (entityTypeKey: EntityTypeKey, id?: string) =>
  `${entityTypeKey} is not found${id ? ` for id: ${id}` : ""}`;

import { type EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";

export const getEntityNotFoundStatusMessage = (entityTypeKey: EntityTypeKey) =>
  `${entityTypeKey} id could not be found`;

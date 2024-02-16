import { type Entity } from "~/models/shared/Entity";

export const getEntityNotFoundStatusMessage = (entity: Entity) => `${entity} id could not be found`;

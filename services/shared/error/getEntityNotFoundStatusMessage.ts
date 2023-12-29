import { type ErrorEntity } from "@/models/shared/error/ErrorEntity";

export const getEntityNotFoundStatusMessage = (errorEntity: ErrorEntity) => `${errorEntity} id could not be found`;

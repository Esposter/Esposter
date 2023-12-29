import { type ErrorEntity } from "@/models/shared/error/ErrorEntity";

export const getInvalidIdStatusMessage = (errorEntity: ErrorEntity) => `${errorEntity} id is invalid`;

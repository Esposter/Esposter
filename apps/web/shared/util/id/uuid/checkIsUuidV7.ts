import { validate, version } from "uuid";

export const checkIsUuidV7 = (uuid: string): boolean => validate(uuid) && version(uuid) === 7;

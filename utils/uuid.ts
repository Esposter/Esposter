import { validate as uuidValidate, version as uuidVersion } from "uuid";

export const uuidValidateV4 = (uuid: string) => uuidValidate(uuid) && uuidVersion(uuid) === 4;

export const UUID_REGEX = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/;

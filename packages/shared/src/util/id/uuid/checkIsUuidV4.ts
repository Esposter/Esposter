import { UUIDV4_REGEX } from "#src/util/id/uuid/constants";

export const checkIsUuidV4 = (uuid: string): boolean => UUIDV4_REGEX.test(uuid);

import { UUIDV7_REGEX } from "@esposter/shared";

export const checkIsUuidV7 = (uuid: string): boolean => UUIDV7_REGEX.test(uuid);

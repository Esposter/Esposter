import { UUIDV4_REGEX } from "@esposter/shared";

export const checkIsUuidV4 = (uuid: string): boolean => UUIDV4_REGEX.test(uuid);

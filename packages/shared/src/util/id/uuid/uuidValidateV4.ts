import { UUIDV4_REGEX } from "@/util/id/uuid/constants";

export const uuidValidateV4 = (uuid: string): boolean => UUIDV4_REGEX.test(uuid);

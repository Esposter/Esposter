import { UUIDV4_REGEX } from "@/util/uuid/constants";

export const uuidValidateV4 = (uuid: string) => UUIDV4_REGEX.test(uuid);

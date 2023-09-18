export const UUIDV4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const uuidValidateV4 = (uuid: string) => UUIDV4_REGEX.test(uuid);

export const NIL = "00000000-0000-0000-0000-000000000000";

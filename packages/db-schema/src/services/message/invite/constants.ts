export const INVITE_ID_LENGTH = 8;
export const INVITE_ID_REGEX = new RegExp(String.raw`^[A-Za-z0-9]{${INVITE_ID_LENGTH}}$`, "u");

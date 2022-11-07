import BigInt from "big-integer";
import hrtime from "browser-hrtime";

export const isServer = () => typeof window === "undefined";

// Get current epoch time in nanoseconds
export const now = () => {
  const [ms, ns] = isServer() ? process.hrtime() : hrtime();
  return BigInt(ms).times(1e9).plus(ns).toString();
};

export const FETCH_LIMIT = 20;

export const USER_MAX_USERNAME_LENGTH = 100;
export const ROOM_MAX_NAME_LENGTH = 100;
export const MESSAGE_MAX_LENGTH = 100;
export const POST_MAX_TITLE_LENGTH = 300;
export const POST_MAX_DESCRIPTION_LENGTH = 1000;
export const CHATBOT_PROMPT_MAX_LENGTH = 100;

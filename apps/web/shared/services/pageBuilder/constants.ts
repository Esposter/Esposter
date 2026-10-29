// A node id also names its class in the emitted CSS, so it is short and unique only within its document
export const NODE_ID_LENGTH = 10;
export const NODE_ID_REGEX = /^[\da-z]+$/iu;
export const NODE_CLASS_PREFIX = "node-";
// The document's node count is bounded so a render, a walk and a patch stay within their budgets
export const MAX_PAGE_NODE_COUNT = 5000;
export const MAX_PAGE_TEXT_LENGTH = 10000;
export const MAX_PAGE_URL_LENGTH = 2048;
export const MAX_PAGE_LANG_LENGTH = 35;
export const PAGE_LANG_REGEX = /^[a-z]{2,3}(?:-[\da-z]{2,8})*$/iu;
export const DEFAULT_PAGE_LANG = "en";
// The survey invite's own colour, the same in a webpage and an email, so an invite reads as one across both
export const SURVEY_INVITE_COLOR = "#F63A4D";

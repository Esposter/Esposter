import { NONCE_PLACEHOLDER } from "#src/runtime/constants";

export const checkIsStaticNonce = (source: string): boolean =>
  source.startsWith("'nonce-") && source !== NONCE_PLACEHOLDER;

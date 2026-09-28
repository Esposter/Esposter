import type { KeyObject } from "node:crypto";

import { createPublicKey } from "node:crypto";

// The host key's public half as the page imports it: an Ed25519 JWK's `x`, the raw key in base64url
export const getPublicKeyText = (privateKey: KeyObject): string =>
  createPublicKey(privateKey).export({ format: "jwk" }).x ?? "";

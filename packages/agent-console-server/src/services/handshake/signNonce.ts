import type { SignaturePurpose } from "#src/models/handshake/SignaturePurpose";
import type { KeyObject } from "node:crypto";

import { getSignedText } from "#src/services/handshake/getSignedText";
import { sign } from "node:crypto";

export const signNonce = (privateKey: KeyObject, purpose: SignaturePurpose, port: number, nonce: string): string =>
  sign(undefined, Buffer.from(getSignedText(purpose, port, nonce)), privateKey).toString("base64url");

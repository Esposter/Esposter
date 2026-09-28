import type { SignaturePurpose } from "#src/models/handshake/SignaturePurpose";
import type { KeyObject } from "node:crypto";

import { getSignedText } from "#src/services/handshake/getSignedText";
import { verify } from "node:crypto";

export const checkIsSignatureValid = (
  key: KeyObject,
  purpose: SignaturePurpose,
  nonce: string,
  signature: string,
): boolean => verify(undefined, Buffer.from(getSignedText(purpose, nonce)), key, Buffer.from(signature, "base64url"));

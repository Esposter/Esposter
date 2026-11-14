import { generateSecretToken } from "@esposter/shared";
import { createHash } from "node:crypto";

// The hash a bearer token is stored as, of a token nobody receives: the copy writes it so that no readable credential reaches D1, and
// the owners regenerate their links after the cutover. The one place a copied row's token is issued. It is the SHA-256 hex digest
// `hashSecretToken` computes, taken synchronously from Node's crypto, since the id map issues it inside a synchronous row mapping
export const issueTokenHash = (): string => createHash("sha256").update(generateSecretToken()).digest("hex");

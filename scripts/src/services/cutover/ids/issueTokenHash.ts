import { generateSecretToken } from "@esposter/shared";
import { createHash } from "node:crypto";

// The hash a bearer token is stored as, of a token nobody receives: the copy writes it so that no readable credential reaches D1.
// The owners regenerate their links after the cutover. This is the one place a copied row's token is issued.
// It is the SHA-256 hex digest that `hashSecretToken` computes, taken synchronously from Node's crypto.
// The id map issues it inside a synchronous row mapping, which is why it is taken synchronously
export const issueTokenHash = (): string => createHash("sha256").update(generateSecretToken()).digest("hex");

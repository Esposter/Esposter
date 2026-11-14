import { generateSecretToken, hashSecretToken } from "@esposter/shared";

// The hash a bearer token is stored as, of a token nobody receives: the copy writes it so that no readable credential reaches D1, and
// the owners regenerate their links after the cutover. The one place a copied row's token is issued
export const issueTokenHash = (): string => hashSecretToken(generateSecretToken());

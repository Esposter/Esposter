import { SCOPE_DIGEST_LENGTH } from "@esposter/db-schema";
import { hashSecretToken } from "@esposter/shared";

// The value a scope topic names. A secret's value is named by the leading digits of its SHA-256, so the topic is never
// The credential, and the read side and the write side name one value alike
export const getScopeValue = async (value: unknown, isSecret: boolean): Promise<string> => {
  if (!isSecret) return String(value);
  const digest = await hashSecretToken(String(value));
  return `sha256:${digest.slice(0, SCOPE_DIGEST_LENGTH)}`;
};

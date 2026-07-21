import { useContainerBaseUrl } from "@@/server/composables/azure/container/useContainerBaseUrl";
import { AzureContainer } from "@esposter/db-schema";

// A url embedded in content is always opened by a delimiter, and that delimiter is what says where the url ends:
// `"…"` and `'…'` close on their own quote, css `url(…)` closes on the paren. Anchoring the match on the opening
// Delimiter makes the terminator known rather than guessed, so each context can permit the characters the others
// Reserve — which is what lets one matcher read both a canonical url and one Azure signed before `encodeBlobUrl`
// Existed, whose path still carries literal `!'()*`. Content authored either way is matched whole; a legacy url
// Is re-signed canonical on the next read, so the content converges without a backfill.
// A url with no opening delimiter (start of content, after whitespace or an unquoted attribute's `=`) keeps the
// Conservative reading that terminates on every delimiter, because nothing narrows it
const BlobUrlContexts = [
  { body: String.raw`[^"\\\s<>]*`, opener: String.raw`"` },
  { body: String.raw`[^'\\\s<>]*`, opener: String.raw`'` },
  { body: String.raw`[^)\\\s<>"']*`, opener: String.raw`\(` },
  { body: String.raw`[^"'()\\\s<>]*`, opener: String.raw`[\s,=>]|^` },
] as const;

export const useBlobUrlSearchRegex = () => {
  const containerBaseUrl = useContainerBaseUrl();
  const prefix = RegExp.escape(`${containerBaseUrl}/${AzureContainer.ResourceAssets}`);
  return new RegExp(BlobUrlContexts.map(({ body, opener }) => `(?<=${opener})${prefix}${body}`).join("|"), "gu");
};

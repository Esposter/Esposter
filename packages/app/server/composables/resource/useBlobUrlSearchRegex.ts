import { useContainerBaseUrl } from "@@/server/composables/azure/container/useContainerBaseUrl";
import { AzureContainer } from "@esposter/db-schema";

// A url embedded in content is always opened by a delimiter, and that delimiter is what says where the url ends:
// `"…"` and `'…'` close on their own quote, css `url(…)` closes on the paren. Anchoring the match on the opening
// Delimiter makes the terminator known rather than guessed, so each context can permit the characters the others
// Reserve — which is what lets one matcher read both a canonical url and one Azure signed before `encodeBlobUrl`
// Existed, whose path still carries literal `!'()*`. Content authored either way is matched whole; a legacy url
// Is re-signed canonical on the next read, so the content converges without a backfill.
// A url with no recognized opening delimiter keeps the conservative reading that terminates on every delimiter,
// Because nothing narrows it. That reading is the fallback for any position, not its own delimiter: enumerating the
// Characters a url may follow leaves every unenumerated one — `;` closing an html entity, `[` in markdown — matching
// Nothing at all, which is a silent miss rather than an over-broad match

// An `&`-escaped quote delimits exactly like the quote it stands for: html-escaped markup is how a style attribute
// Survives serialization into another attribute. Its own `&` must not be read as the start of a SAS parameter, so
// The undelimited body — the one that has to stop somewhere without knowing its terminator — stops on the escape too
// The undelimited body stops on every character a url may not carry literally: the delimiters above plus the
// Remaining RFC 3986 gen-delims and the braces a merge field is written in, none of which survive `encodeBlobUrl`
const EscapedQuote = String.raw`&(?:quot|apos|#34|#39);`;
const UndelimitedBody = String.raw`(?:(?!${EscapedQuote})[^"'()[\]{}\\\s<>])*`;
const BlobUrlContexts: readonly { body: string; opener?: string }[] = [
  { body: String.raw`[^"\\\s<>]*`, opener: String.raw`"` },
  { body: String.raw`[^'\\\s<>]*`, opener: String.raw`'` },
  { body: String.raw`[^)\\\s<>"']*`, opener: String.raw`\(` },
  { body: UndelimitedBody, opener: EscapedQuote },
  { body: UndelimitedBody },
];

export const useBlobUrlSearchRegex = () => {
  const containerBaseUrl = useContainerBaseUrl();
  const prefix = RegExp.escape(`${containerBaseUrl}/${AzureContainer.ResourceAssets}`);
  return new RegExp(
    BlobUrlContexts.map(({ body, opener }) => `${opener ? `(?<=${opener})` : ""}${prefix}${body}`).join("|"),
    "gu",
  );
};

import { SITE_NAME } from "@esposter/shared";

export const DEFAULT_APP_ORIGIN = "https://esposter.com";
// Loopback only unless the person starting the host says otherwise — a host reachable from the network is a
// Decision, never a default
export const DEFAULT_HOSTNAME = "127.0.0.1";
// Fixed so the page can reach this computer's host with nothing but a credential
export const DEFAULT_PORT = 7437;
// The link scheme a page opens to start this computer's host, with a pairing code or none
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template would otherwise infer
export const HOST_SCHEME: string = `${SITE_NAME.toLowerCase()}-host`;
// The one-time pairing code, in the scheme link's query and in the fragment of the link the host prints
export const PAIRING_CODE_PARAMETER = "code";
// The random bytes in a one-time pairing code, which a page's Connect makes and the host prints
export const PAIRING_CODE_BYTE_LENGTH = 32;
// The page's URL fragment that carries a host's address on the link the host prints, read and cleared on load
export const PAIRING_HASH_PARAMETER = "host";
// How much of a shell's latest output the host keeps to replay to a page that connects while it runs, and the page
// Keeps for a terminal opened later, in characters: a few screens, so a reload shows where the shell was without either
// Holding everything it ever printed
export const SHELL_OUTPUT_LENGTH = 100_000;
// How long a code the page opened the host with pairs it: the reader has that long to allow the browser's prompt
export const SCHEME_PAIRING_CODE_DURATION_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
// The most the attachments of one prompt may weigh on the wire, counted as the page sends them: each file's JSON, with
// its base64 and any escapes in it. Sixteen mebibytes is inside Bedrock's 20 MB request limit, the smallest documented
// for the Messages API, so a prompt that attaches this much still has room for its text on every platform
export const ATTACHMENTS_MAX_BYTE_LENGTH: number = 16 * 1024 * 1024;
// The room a message holds beside its attachments for its text and its envelope. The text has no ceiling of its own,
// so a message past this is refused whole, which no typed prompt comes near
export const PROMPT_ENVELOPE_MAX_BYTE_LENGTH: number = 8 * 1024 * 1024;
// The largest message any socket may send the host, admitted or not, so a message over it ends its socket before the
// host holds it
export const MESSAGE_MAX_BYTE_LENGTH: number = ATTACHMENTS_MAX_BYTE_LENGTH + PROMPT_ENVELOPE_MAX_BYTE_LENGTH;

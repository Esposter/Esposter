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
// The page's URL fragment that carries a host's address on the link the host prints, read and cleared on load
export const PAIRING_HASH_PARAMETER = "host";
// How much of a shell's latest output the host keeps to replay to a page that connects while it runs, and the page
// Keeps for a terminal opened later, in characters: a few screens, so a reload shows where the shell was without either
// Holding everything it ever printed
export const SHELL_OUTPUT_LENGTH = 100_000;
// How long a code the page opened the host with pairs it: the reader has that long to allow the browser's prompt
export const SCHEME_PAIRING_CODE_DURATION: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");

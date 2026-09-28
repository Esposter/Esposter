import { SITE_NAME } from "@esposter/shared";

// The subcommand a session's window runs the host executable with
export const SESSION_SUBCOMMAND = "session";
// Where a session's window finds the secret that admits it to the host. The window takes it out of its own environment
// Before its session starts, since the session hands that environment to Claude Code and every tool it runs
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template would otherwise infer
export const SESSION_SECRET_ENVIRONMENT_VARIABLE: string = `${SITE_NAME.toUpperCase()}_SESSION_SECRET`;
export const SESSION_SECRET_BYTE_LENGTH = 32;
// How long a session's window has to connect back before its secret stops admitting anything
export const SESSION_WINDOW_CONNECT_TIMEOUT: number = Temporal.Duration.from({ seconds: 30 }).total("milliseconds");

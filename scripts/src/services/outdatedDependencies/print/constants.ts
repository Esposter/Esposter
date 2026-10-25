// ANSI SGR escape sequences for terminal color; the reset code returns the foreground to the default.
export const ANSI_ESCAPE = "\u001B";

export const ANSI_FOREGROUND_RESET = `${ANSI_ESCAPE}[39m`;

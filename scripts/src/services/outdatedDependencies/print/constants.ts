// ANSI SGR escape sequences for terminal color; the reset code returns the foreground to the default.
export const ANSI_ESCAPE = "\u001B";

// oxlint-disable-next-line typescript/no-inferrable-types -- isolatedDeclarations demands the annotation this value would otherwise infer
export const ANSI_FOREGROUND_RESET: string = `${ANSI_ESCAPE}[39m`;

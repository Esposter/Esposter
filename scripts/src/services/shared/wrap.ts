import { ANSI_ESCAPE, ANSI_FOREGROUND_RESET } from "#src/services/shared/constants";

export const wrap = (code: number, text: string): string => `${ANSI_ESCAPE}[${code}m${text}${ANSI_FOREGROUND_RESET}`;

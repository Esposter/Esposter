import { takeOne } from "@esposter/shared";

// The line a failed command's output opens with, which names the failure without the rest of its diagnostics
export const readFirstLine = (output: string): string => takeOne(output.trim().split(/\r?\n/u), 0);

import { z } from "zod";

// What a host started later needs to take back the windows of one that went away: the loopback port this host listens
// For windows on, and the hash of each open window's secret. Only hashes are kept, so reading the file never yields a
// Secret that admits a window
export interface SessionWindows {
  port: number;
  secretHashes: string[];
}

export const sessionWindowsSchema: z.ZodObject<{ port: z.ZodNumber; secretHashes: z.ZodArray<z.ZodString> }> = z.object(
  { port: z.int().min(0), secretHashes: z.array(z.string().min(1)) },
) satisfies z.ZodType<SessionWindows>;

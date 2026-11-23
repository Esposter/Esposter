import { z } from "zod";

// One object a lock names: the sha256 of its bytes is its name, under its scope and with its extension, and the byte
// Count and content type are what a preload plans by and what a host serves it as
export interface HostedAssetObject {
  bytes: number;
  contentType: string;
  extension: string;
  scope: string;
  sha256: string;
}

export const hostedAssetObjectSchema: z.ZodType<HostedAssetObject> = z.object({
  bytes: z.int().nonnegative(),
  contentType: z.string().min(1),
  extension: z.string(),
  scope: z.string().min(1),
  sha256: z.hash("sha256"),
});

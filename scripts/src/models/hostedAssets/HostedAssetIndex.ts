import { z } from "zod";

// An index object: the sha256 of each entry's record, keyed by the entry's id
export const hostedAssetIndexSchema = z.record(z.string(), z.hash("sha256"));
export type HostedAssetIndex = z.infer<typeof hostedAssetIndexSchema>;

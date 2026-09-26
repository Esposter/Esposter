import type { Resource } from "@esposter/db-schema";

// Bytes this client sent that the server confirmed it stored, by the hash a save hands back — the one document a
// Delta can be computed against, since the server's copy is the dictionary it decodes with
export interface ContentBaseline {
  bytes: Uint8Array<ArrayBuffer>;
  hash: Resource["contentHash"];
  id: Resource["id"];
}

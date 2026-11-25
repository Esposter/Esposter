// The content the server has confirmed holding for this opening: the version it is stored at, the hash the server
// Wrote for it (empty when a Keep mine has not been answered yet), and the serialization a save is compared with, so
// Content already held is never written again
export interface ContentBase {
  hash: string;
  json: string;
  version: number;
}

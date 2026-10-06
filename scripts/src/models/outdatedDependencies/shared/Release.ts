// What the source publishing an entry answers: its newest version, and the digest the entry's own version points at
// Now, for an entry that pins one
export interface Release {
  digest?: string;
  version: string;
}

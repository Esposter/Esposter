// What a builder returns: the notes its step reports, and the records it publishes under their keys
export interface GameDataBuild {
  notes: string[];
  objects: Record<string, unknown>;
}

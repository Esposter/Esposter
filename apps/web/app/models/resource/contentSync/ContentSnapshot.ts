// The content a save carries, taken when the save is asked for: its serialization, which the reducer compares, and the
// Content itself, which the driver sends. The reducer never reads the content, so it stays independent of any type
export interface ContentSnapshot {
  content: unknown;
  json: string;
}

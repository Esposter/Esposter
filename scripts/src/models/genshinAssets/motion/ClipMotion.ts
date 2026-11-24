// A clip's motion: its name and its span in seconds, and the translation of its root from its start to its stop in
// Metres with the speed it gives in metres a second. The speed is given only where the root moves, and both are
// Undefined where no single root's position is decoded to read, such as a clip whose curves ACL compresses out of reach
export interface ClipMotion {
  duration: number;
  name: string;
  rootTranslation?: number | undefined;
  speed?: number | undefined;
}

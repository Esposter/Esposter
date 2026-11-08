// A kind of command a game version update reruns: the heading its plan prints it under and the stamped commands it holds
export interface GameVersionCommandKind {
  heading: string;
  pattern: RegExp;
}

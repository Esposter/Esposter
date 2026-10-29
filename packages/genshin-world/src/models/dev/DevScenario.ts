// A named, ordered list of command lines that puts the game in one state worth checking
export interface DevScenario {
  lines: readonly string[];
  name: string;
}

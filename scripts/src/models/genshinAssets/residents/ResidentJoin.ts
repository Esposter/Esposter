import type { Resident } from "genshin-world";

// The residents each region holds, and what was left out of the join: an NPC a crafting bench stands for, which is an
// Interaction point rather than a person, an NPC with no name, an NPC no talk of the game names, and each repeat
// Placement of an NPC already placed in its region, which the first placement stands for
export interface ResidentJoin {
  craftingBench: number;
  noName: number;
  noTalk: number;
  regions: Map<string, Resident[]>;
  repeated: number;
}

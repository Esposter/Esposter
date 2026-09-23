import type { WorldBox } from "@/models/agentConsole/world/WorldBox";
import type { Promisable } from "type-fest";
// A thing in the world a player uses from within reach of it: its box, which reach is measured to and which is outlined
// While it is the one in reach, and what its key does
export interface WorldPrompt extends WorldBox {
  id: string;
  run: () => Promisable<void>;
  // What the key does, named on the label: "Open", "Close"
  title: string;
}

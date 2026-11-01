import type { CommandRefusal } from "../../models/CommandRefusal";

import { getScanRefusal } from "./getScanRefusal";

const SCAN_COMMANDS: ReadonlySet<string> = new Set(["du", "find", "grep", "ls"]);

export const getScanCommandRefusal: CommandRefusal = (name, args) =>
  SCAN_COMMANDS.has(name) ? getScanRefusal(name, args) : undefined;

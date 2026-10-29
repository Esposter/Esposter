import type { DevResult } from "genshin-world";

// A line the developer console ran and what the registry reported for it, kept in the browser's history
export interface DevConsoleEntry {
  line: string;
  result: DevResult;
}

import type { EngineInterface } from "claude-code";

import { getRecordsPath } from "./getRecordsPath";

// The records file under the person's home folder, the home read from the engine's environment lookup
export const resolveRecordsPath = async ($: EngineInterface): Promise<string> =>
  getRecordsPath((await $.env.get("HOME")) ?? (await $.env.get("USERPROFILE")) ?? "");

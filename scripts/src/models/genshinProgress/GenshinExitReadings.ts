import type { ParityApproval } from "#src/models/genshinParity/shared/ParityApproval";
import type { GenshinLockKeys } from "#src/models/genshinProgress/GenshinLockKeys";

// Everything the exit checks read, each source read once: every reference's bar, the mean each committed score holds, the
// passes report of each region's component, the keys the lock holds and the keys the world's key list names
export interface GenshinExitReadings {
  approvals: Map<string, ParityApproval>;
  lockKeys: GenshinLockKeys;
  means: Map<string, number>;
  passReports: Map<string, string>;
  requiredKeys: GenshinLockKeys;
}

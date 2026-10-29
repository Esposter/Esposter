import type { ResumeItem } from "#src/models/resume/ResumeItem";
import type { ClaimedRef } from "#src/models/shared/ClaimedRef";

import { readRequiredMachineProfile } from "#src/services/fleet/readRequiredMachineProfile";
import { getClaimItems } from "#src/services/resume/getClaimItems";
import { readHoldFiles } from "#src/services/resume/readHoldFiles";

export const readClaimItems = (claimedRefMap: ReadonlyMap<string, ClaimedRef>): ResumeItem[] =>
  getClaimItems(
    claimedRefMap,
    readRequiredMachineProfile().id,
    readHoldFiles(),
    Temporal.Now.instant().epochMilliseconds,
  );

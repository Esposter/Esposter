import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { MACHINE_PROFILE_PATH } from "#src/services/fleet/constants";
import { parseMachineProfile } from "#src/services/fleet/parseMachineProfile";
import { checkIsGenshinOnly } from "#src/services/setup/checkIsGenshinOnly";
import { FLEET_PROFILE_COMMAND, GENSHIN_ONLY_NEXT } from "#src/services/setup/constants";
import { getStepRow } from "#src/services/setup/getStepRow";
import { SetupStatus } from "#src/models/setup/SetupStatus";

// The machine's fleet profile is kept Genshin-only: the areas it is lent name the Genshin area alone
export const readFleetProfileRow = (environment: SetupEnvironment): SetupRow => {
  const step = "fleet profile";
  const text = environment.readText(MACHINE_PROFILE_PATH);
  if (text === undefined) return getStepRow(step, false, `${FLEET_PROFILE_COMMAND}, then ${GENSHIN_ONLY_NEXT}`);
  const profile = parseMachineProfile(text);
  if (profile === undefined)
    return {
      next: `${MACHINE_PROFILE_PATH} is not a profile: it needs an id, areas and capabilities`,
      status: SetupStatus.NeedsYou,
      step,
    };
  return getStepRow(step, checkIsGenshinOnly(profile.areas), GENSHIN_ONLY_NEXT);
};

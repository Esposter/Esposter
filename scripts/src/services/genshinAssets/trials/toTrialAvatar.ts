import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";
import type { TrialAvatar } from "genshin-world";

// The character a trial avatar is and its level, which the parameter list holds in that order
export const toTrialAvatar = ({
  trialAvatarId,
  trialAvatarParamList: [characterId, level],
}: ExcelTrialAvatarRow): TrialAvatar => ({ characterId, level, trialAvatarId });

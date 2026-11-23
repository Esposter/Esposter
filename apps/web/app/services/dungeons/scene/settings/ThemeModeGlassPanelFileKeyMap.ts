import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { ThemeModeSetting } from "#shared/models/dungeons/data/settings/ThemeModeSetting";

export const ThemeModeGlassPanelFileKeyMap = {
  [ThemeModeSetting.Blue]: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionGlassPanel,
  [ThemeModeSetting.Green]: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionGlassPanelGreen,
  [ThemeModeSetting.Purple]: DungeonsKeys.ThirdPartyKenneysAssetsUISpaceExpansionGlassPanelPurple,
} as const satisfies Record<ThemeModeSetting, DungeonsKey>;

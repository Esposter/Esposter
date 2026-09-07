import { FileKey } from "#shared/generated/phaser/FileKey";
import { ThemeModeSetting } from "#shared/models/dungeons/data/settings/ThemeModeSetting";

export const ThemeModeGlassPanelFileKeyMap = {
  [ThemeModeSetting.Blue]: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionGlassPanel,
  [ThemeModeSetting.Green]: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionGlassPanelGreen,
  [ThemeModeSetting.Purple]: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionGlassPanelPurple,
} as const satisfies Record<ThemeModeSetting, FileKey>;

import { toIconMap } from "#src/services/clicker/icon/toIconMap";

export const UpgradeIconMap = toIconMap(
  import.meta.glob<string>("#src/assets/clicker/icons/upgrades/**/*.png", { eager: true, import: "default" }),
);

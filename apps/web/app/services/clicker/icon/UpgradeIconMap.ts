import { toIconMap } from "@/services/clicker/icon/toIconMap";

export const UpgradeIconMap = toIconMap(
  import.meta.glob<string>("@/assets/clicker/icons/upgrades/**/*.png", { eager: true, import: "default" }),
);

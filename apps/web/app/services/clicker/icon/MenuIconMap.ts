import { toIconMap } from "#src/services/clicker/icon/toIconMap";

export const MenuIconMap = toIconMap(
  import.meta.glob<string>("#src/assets/clicker/icons/menu/*.png", { eager: true, import: "default" }),
);

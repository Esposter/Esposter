import { toIconMap } from "#src/services/clicker/icon/toIconMap";

export const BuildingIconMap = toIconMap(
  import.meta.glob<string>("#src/assets/clicker/icons/buildings/*.png", { eager: true, import: "default" }),
);

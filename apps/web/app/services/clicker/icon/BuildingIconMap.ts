import { toIconMap } from "@/services/clicker/icon/toIconMap";

export const BuildingIconMap = toIconMap(
  import.meta.glob<string>("@/assets/clicker/icons/buildings/*.png", { eager: true, import: "default" }),
);

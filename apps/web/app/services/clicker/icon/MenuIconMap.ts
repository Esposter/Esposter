import { toIconMap } from "@/services/clicker/icon/toIconMap";

export const MenuIconMap = toIconMap(
  import.meta.glob<string>("@/assets/clicker/icons/menu/*.png", { eager: true, import: "default" }),
);

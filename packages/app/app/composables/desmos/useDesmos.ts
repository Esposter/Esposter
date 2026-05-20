import { API_URL } from "@/services/desmos/constants";
import { getIsServer } from "@esposter/shared";

export const useDesmos = () =>
  useScript<typeof Desmos>(API_URL, {
    use: () => (getIsServer() ? undefined : window.Desmos),
  });

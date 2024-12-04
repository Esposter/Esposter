import { API_URL } from "@/services/desmos/constants";

export const useDesmos = () =>
  useScript<typeof Desmos>(API_URL, {
    use: () => window.Desmos,
  });

import { useTheme } from "vuetify/lib/framework.mjs";

export const useGlobalTheme = () => useTheme().global.current;

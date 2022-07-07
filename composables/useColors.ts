import { useTheme } from "vuetify/lib/framework.mjs";

export const useColors = () => useTheme().global.current.value.colors;

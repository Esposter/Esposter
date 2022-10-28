import { useTheme } from "vuetify";

export const useColors = () => useTheme().global.current.value.colors;

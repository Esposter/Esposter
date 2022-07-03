import { useTheme } from "vuetify/lib/framework.mjs";

export const useColors = () => useTheme().current.value.colors;

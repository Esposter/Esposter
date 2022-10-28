import { useTheme } from "vuetify";

export const useIsDark = () => useTheme().global.current.value.dark;

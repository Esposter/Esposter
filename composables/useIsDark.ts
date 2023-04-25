import { useTheme } from "vuetify";

export const useIsDark = () => computed(() => useTheme().global.current.value.dark);

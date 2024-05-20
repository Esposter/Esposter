import { useTheme } from "vuetify";

export const useGlobalTheme = () => {
  const theme = useTheme();
  return theme.global;
};

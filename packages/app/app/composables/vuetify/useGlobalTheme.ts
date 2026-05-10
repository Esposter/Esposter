export const useGlobalTheme = () => {
  const theme = useVTheme();
  return theme.global;
};

export const useIsDark = () => {
  const globalTheme = useGlobalTheme();
  return computed(() => globalTheme.current.value.dark);
};

export const useIsDark = () => {
  const { global } = useVTheme();
  return computed(() => global.current.value.dark);
};

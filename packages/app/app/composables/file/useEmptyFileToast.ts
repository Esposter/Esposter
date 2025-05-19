export const useEmptyFileToast = () =>
  useToast(`You can only upload non-empty files!`, { cardProps: { color: "error" } });

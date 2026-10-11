export const contains =
  (text: string) =>
  (value: string | undefined): boolean =>
    Boolean(value?.toLowerCase().includes(text.toLowerCase()));

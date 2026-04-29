export const normalizeString = (value: null | string | undefined): string => value?.trim() ?? "";

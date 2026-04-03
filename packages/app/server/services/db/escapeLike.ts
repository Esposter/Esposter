export const escapeLike = (value: string): string => value.replaceAll(/[%_\\]/g, "\\$&");

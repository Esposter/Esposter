export const getToggleColumnPinDescription = (name: string, fixed: boolean) =>
  `${fixed ? "Unpin" : "Pin"} "${name}" Column`;

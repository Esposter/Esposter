export const getToggleColumnVisibilityDescription = (name: string, isHidden: boolean) =>
  `${isHidden ? "Show" : "Hide"} "${name}" Column`;

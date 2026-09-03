import { normalizeString } from "@esposter/shared";

export const getInitials = (fullName: string) => {
  const allNames = normalizeString(fullName).split(" ");
  const initials = allNames.reduce((acc, name, index) => {
    if (index === 0 || index === allNames.length - 1) return `${acc}${name.charAt(0).toUpperCase()}`;
    return acc;
  }, "");
  return initials;
};

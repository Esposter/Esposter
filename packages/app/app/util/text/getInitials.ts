import { normalizeString } from "@esposter/shared";

export const getInitials = (fullName: string) => {
  const allNames = normalizeString(fullName).split(" ");
  return allNames.reduce((accumulator, name, index) => {
    if (index === 0 || index === allNames.length - 1) return `${accumulator}${name.charAt(0).toUpperCase()}`;
    else return accumulator;
  }, "");
};

import { normalizeString } from "@esposter/shared";

// First and last name only, so a middle name adds no letter — and a single name contributes one
export const getInitials = (fullName: string) => {
  const [firstName = "", ...restNames] = normalizeString(fullName).split(" ");
  const lastName = restNames.at(-1) ?? "";
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

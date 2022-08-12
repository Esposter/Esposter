import { validate as uuidValidate, version as uuidVersion } from "uuid";

export const getInitials = (fullName: string) => {
  const allNames = fullName.trim().split(" ");
  const initials = allNames.reduce((acc, curr, index) => {
    if (index === 0 || index === allNames.length - 1) acc += curr.charAt(0).toUpperCase();
    return acc;
  }, "");
  return initials;
};

export const uuidValidateV4 = (uuid: string) => uuidValidate(uuid) && uuidVersion(uuid) === 4;

import { InvalidOperationError, Operation } from "@esposter/shared";

const OFFSET_REGEX = /^(?:GMT|UTC)(?<sign>[+-])(?<hours>\d{1,2})$/u;
// The GMT or UTC offset a page writes its times at, as the zone it names: `GMT+8` and `UTC+8` are `+08:00`
export const readTimeZone = (value: string): string => {
  const groups = OFFSET_REGEX.exec(value)?.groups;
  if (groups?.sign === undefined || groups.hours === undefined)
    throw new InvalidOperationError(Operation.Read, value, "is not a GMT offset");

  return `${groups.sign}${groups.hours.padStart(2, "0")}:00`;
};

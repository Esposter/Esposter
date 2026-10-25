import { COMPONENT_REGEX } from "#src/services/genshinParity/sky/constants";

// A setting's number by a solved name: the setting's own, or a vector setting's component the name addresses
export const readSolvedSetting = (settings: Record<string, number | number[]>, name: string): number | undefined => {
  const whole = settings[name];
  if (typeof whole === "number") return whole;
  const groups = COMPONENT_REGEX.exec(name)?.groups;
  const vector = groups?.name === undefined ? undefined : settings[groups.name];
  return Array.isArray(vector) ? vector[Number(groups?.index)] : undefined;
};

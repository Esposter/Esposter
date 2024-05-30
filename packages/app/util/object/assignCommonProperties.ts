export const assignCommonProperties = <T extends object>(object: T, objectToAssign: object) => {
  for (const [key, value] of Object.entries(objectToAssign)) {
    if (!Object.hasOwn(object, key)) continue;
    object[key] = value;
  }

  return object;
};

export const replaceProperties = <T extends object>(objectToReplace: T, newObject: object) => {
  // Replace with new properties
  for (const [key, value] of Object.entries(newObject)) {
    objectToReplace[key] = value;
  }
  // Remove properties that don't exist in new object
  for (const key of Object.keys(objectToReplace) as (keyof T)[]) {
    if (!Object.hasOwn(newObject, key)) {
      delete objectToReplace[key];
      continue;
    }
  }

  return objectToReplace;
};

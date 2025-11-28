/**
 * Extracts all non-function, non-numeric-index properties from a type recursively.
 * Returns a union of objects with path (dot-notation) and value for each property.
 */
export type RecursiveGetProperties<PropertyValue, Prefix extends string | undefined = undefined> =
  // Get all keys. If T is a Union, this returns the intersection of keys (handling the string | number test).
  keyof PropertyValue extends infer PropertySubKey
    ? PropertySubKey extends string
      ? PropertyValue[keyof PropertyValue & PropertySubKey] extends infer PropertySubValue
        ? // Filter out:
          // 1. Functions (methods like toString, etc.)
          // 2. Numeric indices (array indices "0", "1", etc.)
          PropertySubValue extends Function
          ? never
          : PropertySubKey extends `${number}`
            ? never
            :
                | (RecursiveGetProperties<PropertySubValue, PropertySubKey> extends infer PropertySub
                    ? PropertySub extends { path: infer SubPath; value: infer SubValue }
                      ? SubPath extends string
                        ? {
                            path: SubPath;
                            value: SubValue;
                          }
                        : never
                      : never
                    : never)
                | {
                    path: Prefix extends undefined ? PropertySubKey : `${Prefix}.${PropertySubKey}`;
                    value: PropertySubValue;
                  }
        : never
      : never
    : never;

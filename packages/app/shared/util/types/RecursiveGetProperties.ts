/**
 * Extracts all non-function, non-numeric-index properties from a type recursively.
 * Returns a union of objects with path (dot-notation) and value for each property.
 */
export type RecursiveGetProperties<PropertyValue, Prefix extends string | undefined = undefined> =
  // Unwrap Null/Undefined: This allows us to find keys on "type | null | undefined" or "symbol" (description)
  NonNullable<PropertyValue> extends infer NonNullablePropertyValue
    ? keyof NonNullablePropertyValue extends infer PropertySubKey
      ? PropertySubKey extends string
        ? NonNullablePropertyValue[keyof NonNullablePropertyValue & PropertySubKey] extends infer PropertySubValue
          ? // Filter out:
            // 1. Functions (methods like toString)
            // 2. Numeric indices (array indices)
            // IMPORTANT: Use [...] syntax to PREVENT distribution.
            // This ensures { value: string | undefined } stays as one object instead of splitting.
            [PropertySubValue] extends [Function]
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
      : never
    : never;

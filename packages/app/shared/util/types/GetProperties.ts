/**
 * Extracts all non-function, non-numeric-index properties from a type
 * and returns a union of objects with path and value for each property
 */
export type GetProperties<TPropertyValue> = keyof TPropertyValue extends infer PropertySubKey
  ? PropertySubKey extends string
    ? TPropertyValue[keyof TPropertyValue & PropertySubKey] extends infer SubValue
      ? // Filter out:
        // 1. Functions (we don't want "string.toString", "string.charAt")
        // 2. Numeric indices (we don't want "array.0", "array.1")
        SubValue extends Function
        ? never
        : PropertySubKey extends `${number}`
          ? never
          : {
              path: PropertySubKey;
              value: SubValue;
            }
      : never
    : never
  : never;

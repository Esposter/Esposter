// Whether a value is one of an enum's values, so a string read from a file or a flag narrows to the enum's type
export const checkIsEnumValue = <TEnum extends Record<string, string>>(
  enumObject: TEnum,
  value: string,
): value is TEnum[keyof TEnum] => Object.values(enumObject).some((enumValue) => enumValue === value);

export const useEnumRouteQuery = <TEnum extends string>(
  key: string,
  enumValues: ReadonlySet<TEnum>,
  defaultValue: TEnum,
): Ref<TEnum> =>
  useRouteQuery(key, defaultValue, {
    transform: (value) => (enumValues.has(value) ? value : defaultValue),
  });

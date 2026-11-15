// A PMX file stores each kind as a byte; the byte is one of the kind's values only when the set lists it
export const checkIsPmxValue = <TValueSet extends Record<string, number | string>>(
  valueSet: TValueSet,
  value: number,
): value is Extract<TValueSet[keyof TValueSet], number> => Object.values(valueSet).includes(value);

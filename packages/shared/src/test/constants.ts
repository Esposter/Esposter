import { noop } from "#src/util/function/noop";

export const ALL_SPECIAL_VALUES: { isPlainObject: boolean; value: unknown }[] = [
  { isPlainObject: true, value: {} },
  { isPlainObject: true, value: Object.create(null) },
  { isPlainObject: false, value: [] },
  { isPlainObject: false, value: new Date() },
  { isPlainObject: false, value: null },
  { isPlainObject: false, value: undefined },
  { isPlainObject: false, value: "" },
  { isPlainObject: false, value: 0 },
  { isPlainObject: false, value: Symbol("") },
  { isPlainObject: false, value: noop },
  { isPlainObject: false, value: /(?:)/u },
];

// A field the wiki may leave out, which is read only when it is there and then must pass its own check
export const checkIsOptional = (value: unknown, check: (value: unknown) => boolean): boolean =>
  value === undefined || check(value);

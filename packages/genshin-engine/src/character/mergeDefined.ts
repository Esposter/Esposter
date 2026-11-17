// The base with each override it holds a value for taken over, and one left undefined keeping the base's value
export const mergeDefined = <T extends object>(base: T, overrides: { [Key in keyof T]?: T[Key] | undefined }): T => ({
  ...base,
  ...Object.fromEntries(Object.entries(overrides).filter(([, value]) => value !== undefined)),
});

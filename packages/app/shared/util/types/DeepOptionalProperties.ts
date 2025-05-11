export type DeepOptionalProperties<T> = {
  // Properties that DO include undefined (become optional '?')
  [K in keyof T as undefined extends T[K] ? K : never]?: DeepOptionalProperties<T[K]>;
};

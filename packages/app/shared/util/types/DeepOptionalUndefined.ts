export type DeepOptionalUndefined<T> = T extends (...args: unknown[]) => unknown // Handle Functions
  ? T // Don't transform functions
  : T extends (infer U)[] // Handle Arrays
    ? DeepOptionalUndefined<U>[] // Recurse on array elements
    : T extends readonly (infer U)[] // Handle Readonly Arrays
      ? readonly DeepOptionalUndefined<U>[] // Recurse on readonly array elements
      : T extends object // Handle Objects
        ? // Combine required and optional properties correctly
          {
            // Properties that DO include undefined (become optional '?')
            [K in keyof T as undefined extends T[K] ? K : never]?: DeepOptionalUndefined<T[K]>;
          } & {
            // Properties that DON'T include undefined (remain required)
            [K in keyof T as undefined extends T[K] ? never : K]: DeepOptionalUndefined<T[K]>;
          }
        : T;

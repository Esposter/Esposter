export type DeepRequiredProperties<T> = {
  // Properties that DON'T include undefined (remain required)
  [K in keyof T as undefined extends T[K] ? never : K]: DeepRequiredProperties<T[K]>;
};

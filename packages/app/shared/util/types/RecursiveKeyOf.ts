export type RecursiveKeyOf<T> = T extends object
  ? {
      [P in keyof T]: P | RecursiveKeyOf<T[P]>;
    }[keyof T]
  : never;

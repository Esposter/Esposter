export type RecursiveKeyOf<T> = string &
  (T extends object
    ? {
        [P in keyof T & (number | string)]: P | RecursiveKeyOf<T[P]>;
      }[keyof T & (number | string)]
    : never);

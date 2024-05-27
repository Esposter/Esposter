export type RecursiveKeyOf<T> = T extends object
  ? {
      [P in (string | number) & keyof T]: P | RecursiveKeyOf<T[P]>;
    }[(string | number) & keyof T]
  : never;

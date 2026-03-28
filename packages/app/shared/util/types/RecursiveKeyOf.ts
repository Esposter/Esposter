export type RecursiveKeyOf<T> = T extends object
  ? T extends Date | Function | RegExp | unknown[]
    ? never
    : {
        [P in keyof T]: `${P & string}.${RecursiveKeyOf<T[P]> & string}` | P | RecursiveKeyOf<T[P]>;
      }[keyof T]
  : never;

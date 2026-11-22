export interface TakeOne {
  <T extends readonly unknown[]>(values: T, index?: number): T[number];
  // eslint-disable-next-line no-restricted-syntax -- takeOne types an array's element and a record's value with two signatures, since one conditional signature would need a cast in its implementation
  <T extends object>(values: T, index: keyof T): T[keyof T];
}

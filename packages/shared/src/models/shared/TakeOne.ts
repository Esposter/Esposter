export interface TakeOne {
  <T extends readonly unknown[]>(values: T, index?: number): T[number];
  <T extends object>(values: T, index: keyof T): T[keyof T];
}

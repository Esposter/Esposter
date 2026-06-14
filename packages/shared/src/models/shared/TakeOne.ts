export interface TakeOne {
  <T extends readonly unknown[]>(values: T, index?: number): T[number];
  <T extends object | Record<PropertyKey, unknown>>(values: T, index: keyof T): T[keyof T];
}

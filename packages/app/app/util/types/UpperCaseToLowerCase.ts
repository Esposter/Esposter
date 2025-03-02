export type UpperCaseToLowerCase<T extends string> = T extends Uppercase<T> ? Lowercase<T> : T;

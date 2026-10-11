import type { Get, Paths } from "type-fest";

// Every path into a value with the value at it, plus `.length` for each string or array one of those paths reaches:
// The one virtual property the achievement definitions read off a value
export type PropertyPathValue<T> =
  | { [P in Paths<T>]: { path: P; value: Get<T, P & string> } }[Paths<T>]
  | {
      [P in Paths<T>]: Extract<Get<T, P & string>, string | unknown[]> extends never
        ? never
        : { path: `${P}.length`; value: number };
    }[Paths<T>];

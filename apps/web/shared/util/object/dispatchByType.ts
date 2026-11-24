// Calls the handler a value's `type` picks, which the compiler types as the union of every handler, each taking its own
// Variant, so a call through the union takes the intersection of their parameters. The handler the value's type names
// Is the one whose variant the value is, so the one call is asserted here and a dispatch names no cast of its own
export const dispatchByType = <
  TType extends PropertyKey,
  TValue extends { type: TType },
  TArgs extends unknown[],
  TResult,
>(
  handlers: { [K in TType]: (value: Extract<TValue, { type: K }>, ...args: TArgs) => TResult },
  value: TValue,
  ...args: TArgs
): TResult =>
  /* oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the handler is picked by the value's runtime type,
     so the union of the handlers is narrowed to the one taking the value's own variant, which the compiler cannot
     correlate with the type */
  (handlers[value.type] as (value: TValue, ...args: TArgs) => TResult)(value, ...args);

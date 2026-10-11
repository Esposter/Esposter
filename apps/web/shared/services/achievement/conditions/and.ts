export const and =
  <TInput>(...predicates: ((input: TInput) => boolean)[]) =>
  (input: TInput): boolean =>
    predicates.every((predicate) => predicate(input));

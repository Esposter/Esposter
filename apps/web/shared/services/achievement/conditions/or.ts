export const or =
  <TInput>(...predicates: ((input: TInput) => boolean)[]) =>
  (input: TInput): boolean =>
    predicates.some((predicate) => predicate(input));

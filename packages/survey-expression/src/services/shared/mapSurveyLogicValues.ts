// Each value of a record mapped by the function it is handed, with its name kept: the one walk over a record's values.
// A caller that reads a value recursively passes itself in, rather than repeating the walk
export const mapSurveyLogicValues = <T, U>(record: Record<string, T>, mapValue: (value: T) => U): Record<string, U> =>
  Object.fromEntries(Object.entries(record).map(([name, value]) => [name, mapValue(value)]));

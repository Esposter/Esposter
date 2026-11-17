// An attribute with an empty value is absent, so only the ones with text are checked or written
export const getFilledMjmlAttributes = (attributes: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(attributes).filter(([, value]) => value));

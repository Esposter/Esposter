// The model with its undefined keys left out, so an attribute the document does not write is absent from the model
// Rather than present as undefined, which an Object.assign over a previous value would copy onto it
export const withoutUndefined = <T extends object>(value: T): T =>
  // Object.fromEntries reads the keys back as one index signature, which is the value's own keys with the undefined ones dropped
  Object.fromEntries(Object.entries(value).filter(([, propertyValue]) => propertyValue !== undefined)) as T;

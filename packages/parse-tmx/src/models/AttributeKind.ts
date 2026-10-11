// How an element attribute reads. A required kind is always in the model, as the zero value of its kind when the
// Document omits it, and an optional kind is absent from the model instead.
export enum AttributeKind {
  Number = "number",
  RequiredNumber = "requiredNumber",
  RequiredString = "requiredString",
  String = "string",
}

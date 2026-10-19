// The identifier a line gives a named field of a gcsim value: `Field: name,` in a literal or `<x>.Field = name` in an
// Assignment, where the name is a dotted identifier such as `attributes.Cryo`, or `true` for a flag
export const readGcsimFieldIdentifier = (lineText: string, field: string): string | undefined =>
  new RegExp(
    String.raw`(?:\b${RegExp.escape(field)}:|\.${RegExp.escape(field)}\s*=)\s*(?<identifier>[A-Za-z_][\w.]*)`,
    "u",
  ).exec(lineText)?.groups?.identifier;

// What a `references pack` run stores: a reference the map names, or a record, a fitted or authored file that exists only on
// A disk. Each kind decides where a restore writes it
export enum ReferencePackKind {
  Record = "record",
  Reference = "reference",
}

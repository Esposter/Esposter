// What a `references pack` run stores: a reference the map names, a recording file, or a record, which is a fitted or
// authored file that exists only on a disk. Each kind decides its manifest section and where a restore writes it
export enum ReferencePackKind {
  Record = "record",
  Recording = "recording",
  Reference = "reference",
}

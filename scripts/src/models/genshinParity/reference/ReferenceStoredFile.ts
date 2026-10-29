// Packed bytes that a `references pack` run writes to the committed path of a reference's image or plate
export interface ReferenceStoredFile {
  bytes: Buffer;
  path: string;
}

// Packed bytes that a `references pack` run stores under their hash, once in each account
export interface ReferenceStoredObject {
  bytes: Buffer;
  sha256: string;
}

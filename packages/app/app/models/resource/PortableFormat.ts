export interface PortableFormat {
  accept?: string;
  deserialize?: (content: string) => unknown;
  mimeType: string;
  serialize?: (content: unknown) => string;
}

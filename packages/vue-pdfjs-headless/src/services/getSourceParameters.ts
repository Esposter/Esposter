import type { PdfSource } from "#src/models/PdfSource";

// A file is read into bytes, and bytes are copied, since the renderer takes over the buffer it is given
export const getSourceParameters = async (source: PdfSource): Promise<{ data: Uint8Array } | { url: string }> => {
  if (typeof source === "string") return { url: source };
  if (source instanceof File) return { data: new Uint8Array(await source.arrayBuffer()) };

  return { data: new Uint8Array(source) };
};

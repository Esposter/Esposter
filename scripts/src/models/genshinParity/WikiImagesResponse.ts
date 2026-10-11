// The part of the wiki's images generator the parity tool reads, spelled as the API spells it: the article's images
// As pages by id, each with the sizes and URL its imageinfo answers, and the parameters that ask for the next batch
// When one response does not hold them all. An error is answered under HTTP 200, in place of the batch
export interface WikiImagesResponse {
  continue?: Record<string, string>;
  error?: { code: string; info: string };
  query?: { pages?: Record<string, { imageinfo?: { height: number; url: string; width: number }[]; title?: string }> };
}

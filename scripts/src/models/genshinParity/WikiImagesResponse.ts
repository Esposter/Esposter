// The part of the wiki's images generator the parity tool reads, spelled as the API spells it: the article's images
// As pages by id, each with the sizes and URL its imageinfo answers
export interface WikiImagesResponse {
  query?: { pages?: Record<string, { imageinfo?: { height: number; url: string; width: number }[]; title?: string }> };
}

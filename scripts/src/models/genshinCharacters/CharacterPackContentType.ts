// The type each file of a pack is served as: the images a browser decodes by their own signatures, the model's bytes,
// And the terms as UTF-8 text. A texture whose signature is none of the images is served as bytes, and reported
export enum CharacterPackContentType {
  Bmp = "image/bmp",
  Gif = "image/gif",
  Jpeg = "image/jpeg",
  OctetStream = "application/octet-stream",
  Png = "image/png",
  Text = "text/plain; charset=utf-8",
  Webp = "image/webp",
}

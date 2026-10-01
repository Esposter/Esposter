const DEFAULT_QUALITY = 1;
// The tags of an `Accept-Language` header, most preferred first: each weighed by its `q`, a tag with none at full
// Weight, and ties kept in the order the header gives them
export const getAcceptLanguageTags = (header: string): string[] =>
  header
    .split(",")
    .map((part) => {
      const [tag = "", ...parameters] = part.split(";").map((piece) => piece.trim());
      const qualityParameter = parameters.find((parameter) => parameter.startsWith("q="));
      const quality = qualityParameter ? Number(qualityParameter.slice("q=".length)) : DEFAULT_QUALITY;
      return { quality: Number.isNaN(quality) ? 0 : quality, tag };
    })
    .filter(({ quality, tag }) => tag && quality > 0)
    .toSorted((first, second) => second.quality - first.quality)
    .map(({ tag }) => tag);

import { HTML_TAG_REGEX } from "#src/runtime/constants";

// Each start tag is matched whole, its quoted attribute values included.
// So markup inside an attribute value is part of the tag and never a tag of its own.
// A `script` or `style` element is matched with its body, which is passed through unchanged.
// So the text of a script is never read as markup.
export const rewriteHtmlTags = (
  html: string,
  rewriteAttributes: (tagName: string, attributes: string) => string | undefined,
): string =>
  html.replace(
    HTML_TAG_REGEX,
    (
      match: string,
      elementName: string | undefined,
      elementAttributes: string | undefined,
      elementTrailer: string | undefined,
      body: string | undefined,
      tagName: string | undefined,
      tagAttributes: string | undefined,
      tagTrailer: string | undefined,
    ) => {
      if (elementName) {
        const attributes = rewriteAttributes(elementName, elementAttributes ?? "") ?? elementAttributes;
        return `<${elementName}${attributes}${elementTrailer}>${body}</${elementName}>`;
      }

      const attributes = rewriteAttributes(tagName ?? "", tagAttributes ?? "");
      return attributes === undefined ? match : `<${tagName}${attributes}${tagTrailer}>`;
    },
  );

import { readHtmlTagAttribute } from "#src/runtime/services/readHtmlTagAttribute";
import { rewriteHtmlTags } from "#src/runtime/services/rewriteHtmlTags";

// The elements an integrity attribute is written onto, keyed by the attribute that names the resource.
// They are also keyed by the `rel` a link must carry.
// A link is one of the three that load a script or stylesheet, and an icon is not
const RESOURCE_ATTRIBUTE_NAMES: Record<string, string> = { link: "href", script: "src" };
const INTEGRITY_LINK_RELS = new Set(["modulepreload", "preload", "stylesheet"]);

// Each script and stylesheet named in the hashes gets its integrity attribute, unless it already carries one
export const injectSubresourceIntegrity = (html: string, hashes: Record<string, string>): string =>
  rewriteHtmlTags(html, (tagName, attributes) => {
    const resourceAttributeName = RESOURCE_ATTRIBUTE_NAMES[tagName.toLowerCase()];
    if (!resourceAttributeName || readHtmlTagAttribute(attributes, "integrity") !== undefined) return undefined;

    const resource = readHtmlTagAttribute(attributes, resourceAttributeName);
    if (resource === undefined || hashes[resource] === undefined) return undefined;
    if (tagName.toLowerCase() === "link" && !INTEGRITY_LINK_RELS.has(readHtmlTagAttribute(attributes, "rel") ?? ""))
      return undefined;

    return ` integrity="${hashes[resource]}"${attributes}`;
  });

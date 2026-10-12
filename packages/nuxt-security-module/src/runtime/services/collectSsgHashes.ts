import type { SsgOptions } from "#src/models/SsgOptions";
import type { SecurityState } from "#src/runtime/services/getSecurityState";

import { CSP_HASH_ALGORITHM, HTML_TAG_REGEX } from "#src/runtime/constants";
import { generateHash } from "#src/runtime/services/generateHash";
import { readHtmlTagAttribute } from "#src/runtime/services/readHtmlTagAttribute";

// The `as` values of a preload that loads a script a page then runs, which the policy must allow as a script
const SCRIPT_PRELOAD_TYPES = new Set(["audioworklet", "paintworklet", "script", "xslt"]);

type SsgElement = [name: string, attributes: string, body: string | undefined];
type SsgHashSource = [kind: keyof SecurityState["hashes"], source: string];

const getSsgHashSource = async (
  [name, attributes, body]: SsgElement,
  { hashScripts, hashStyles }: SsgOptions,
): Promise<SsgHashSource | undefined> => {
  const integrity = readHtmlTagAttribute(attributes, "integrity");

  if (name === "script" && hashScripts) {
    const source = readHtmlTagAttribute(attributes, "src");
    if (source !== undefined && integrity !== undefined) return ["script", `'${integrity}'`];
    if (source === undefined && body) return ["script", `'${await generateHash(body, CSP_HASH_ALGORITHM)}'`];
    return undefined;
  }
  if (name === "style" && hashStyles && body) return ["style", `'${await generateHash(body, CSP_HASH_ALGORITHM)}'`];
  if (name !== "link" || integrity === undefined) return undefined;

  const rel = readHtmlTagAttribute(attributes, "rel");
  const as = readHtmlTagAttribute(attributes, "as") ?? "";
  if (rel === "stylesheet" && hashStyles) return ["style", `'${integrity}'`];
  if (hashScripts && (rel === "modulepreload" || (rel === "preload" && SCRIPT_PRELOAD_TYPES.has(as))))
    return ["script", `'${integrity}'`];
  return undefined;
};

// The sources a prerendered page's policy needs for the scripts and styles it renders, each quoted as a CSP source.
// An inline element is hashed by its body.
// An element or link that carries an integrity attribute contributes that attribute as it stands.
export const collectSsgHashes = async (html: string, options: SsgOptions): Promise<SecurityState["hashes"]> => {
  const elements = Array.from(
    html.matchAll(HTML_TAG_REGEX),
    ([, elementName, elementAttributes, , body, tagName, tagAttributes]): SsgElement => [
      (elementName ?? tagName ?? "").toLowerCase(),
      elementAttributes ?? tagAttributes ?? "",
      body,
    ],
  );
  const hashSources = await Promise.all(elements.map((element) => getSsgHashSource(element, options)));
  const hashes: SecurityState["hashes"] = { script: [], style: [] };
  for (const hashSource of hashSources) if (hashSource) hashes[hashSource[0]].push(hashSource[1]);

  return hashes;
};

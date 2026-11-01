import type { SsgElement } from "#src/models/SsgElement";
import type { SsgOptions } from "#src/models/SsgOptions";
import type { SecurityState } from "#src/runtime/services/getSecurityState";

import { HTML_TAG_REGEX } from "#src/runtime/constants";
import { getSsgHashSource } from "#src/runtime/services/getSsgHashSource";

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

import type { SsgElement } from "#src/models/SsgElement";
import type { SsgHashSource } from "#src/models/SsgHashSource";
import type { SsgOptions } from "#src/models/SsgOptions";

import { CSP_HASH_ALGORITHM } from "#src/runtime/constants";
import { generateHash } from "#src/runtime/services/generateHash";
import { readHtmlTagAttribute } from "#src/runtime/services/readHtmlTagAttribute";

// The `as` values of a preload that loads a script a page then runs, which the policy must allow as a script
const SCRIPT_PRELOAD_TYPES = new Set(["audioworklet", "paintworklet", "script", "xslt"]);

export const getSsgHashSource = async (
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

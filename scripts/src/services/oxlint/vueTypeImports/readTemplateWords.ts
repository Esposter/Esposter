import { readFileSync } from "node:fs";

// Every `<template>` and `</template>` tag, root or nested. Counting how deep each opens and closes finds the root.
// A nested `<template v-if>` ends before the root does, so the root is the block that closes back at depth zero.
const TEMPLATE_TAG_REGEX = /<(?<closing>\/?)template(?=[\s>])[^>]*>/gu;
// A word of the template, the way a binding is named there: a whole word, with a hyphen joining a tag's kebab-case name
const TEMPLATE_WORD_REGEX = /[\w$-]+/gu;

// The text of the root `<template>` block, empty when the file has none
const readRootTemplate = (source: string): string => {
  let depth = 0;
  let start = 0;
  for (const match of source.matchAll(TEMPLATE_TAG_REGEX)) {
    const isClosing = match.groups?.closing === "/";
    depth += isClosing ? -1 : 1;
    if (!isClosing && depth === 1) start = match.index;
    if (isClosing && depth === 0) return source.slice(start, match.index + match[0].length);
  }
  return "";
};

// The file is linted from its script alone, so its template is read off the disk
export const readTemplateWords = (filename: string): Set<string> =>
  new Set(readRootTemplate(readFileSync(filename, "utf8")).match(TEMPLATE_WORD_REGEX));

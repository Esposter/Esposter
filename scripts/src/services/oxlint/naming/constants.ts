export const MESSAGE =
  "A binding named after the call that produced it (`const readPost = await readPost(…)`) holds the value, not the fetch — drop the verb prefix (`const post = …`). See the naming skill.";
// The naming skill's own function prefixes: a call under one of these answers with something the prefix
// Describes the getting of, so a binding wearing the same name is holding the answer under the verb. A call named
// For what it returns (`file.text()`, `scene.add.sprite(…)`, `Date.now()`) has no verb to drop
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const VERB_PREFIX_REGEX: RegExp = /^(?:read|get|compute|create|generate|search|count)[A-Z]/u;
export const SITE_NAME_LITERAL_MESSAGE =
  "The product's name is spelled out in a string. A value in a namespace other programs share derives it from `SITE_NAME` in that namespace's casing, and text on our own surface drops it. See the naming skill's shared-namespaces page.";
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const SITE_NAME_REGEX: RegExp = /esposter/iu;
// Where the name is an address rather than a label: a workspace package, a web address, the repository's own slug
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const SITE_NAME_ALLOWED_REGEX: RegExp = /@esposter\b|https?:\/\/|Esposter\/Esposter/u;

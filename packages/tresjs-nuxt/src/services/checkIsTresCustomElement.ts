import { TRES_CORE_COMPONENT_NAMES } from "#src/services/constants";

const PRIMITIVE_TAG_NAME = "primitive";
const TRES_COMPONENT_NAME_REGEX = /^Tres[A-Z]/u;
const TRES_ELEMENT_NAME_PREFIX = "tres-";

// The renderer's own compiler predicate, restated here so configuration never loads the renderer to read it
export const checkIsTresCustomElement = (tagName: string): boolean =>
  ((TRES_COMPONENT_NAME_REGEX.test(tagName) || tagName.startsWith(TRES_ELEMENT_NAME_PREFIX)) &&
    !TRES_CORE_COMPONENT_NAMES.includes(tagName)) ||
  tagName === PRIMITIVE_TAG_NAME;

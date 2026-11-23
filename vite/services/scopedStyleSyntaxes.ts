import type { SelectorBan } from "#scripts/models/oxlint/selectorBan/SelectorBan";

import { htmlElementAttributes } from "#vite/services/htmlElementAttributes";
import { htmlTagNames } from "#vite/services/htmlTagNames";

// A package styled by scoped CSS has no UnoCSS to read an attribute as a utility, so an attribute the HTML standard
// Does Not define on a native element (`size-full`, `p="2"`) styles nothing, and the element takes the browser's
// Defaults. It accepts the standard's attributes (global and per element), WAI-ARIA's `role` and `aria-*`, custom data,
// And the Two Vue keeps for itself. vize's tree carries no namespace, so SVG and MathML are told apart by their root:
// An element Under one is not HTML's, unless a `foreignObject` holds it. Vue's `<template>` and `<slot>` share HTML's
// Names but are The framework's outlets, whose bound Attributes are slot props. Elements accepting the same attributes
// Share one selector
const FOREIGN_ROOT_NAMES = ["math", "svg"];
// An SVG `foreignObject` holds HTML again, and an svg nested in it is foreign once more; a `foreignObject` nested
// Inside That inner svg is not followed back to HTML
const FOREIGN_OBJECT_SELECTOR = "VElement[rawName=/^foreignObject$/i]";
const FOREIGN_ROOT_SELECTOR = `VElement[rawName=/^(?:${FOREIGN_ROOT_NAMES.join("|")})$/]`;
const VUE_OUTLET_NAMES = new Set(["slot", "template"]);
const VUE_RESERVED_ATTRIBUTE_NAMES = ["key", "ref"];
const MESSAGE =
  "Don't write an attribute the HTML standard does not define on this element: a package styled by scoped CSS generates no utility from it, so it styles nothing. Write the style in the component's scoped style block.";

const ownAttributesTagNamesMap = Map.groupBy(
  htmlTagNames.filter((tagName) => !FOREIGN_ROOT_NAMES.includes(tagName) && !VUE_OUTLET_NAMES.has(tagName)),
  (tagName) => (htmlElementAttributes[tagName] ?? []).join(","),
);

export const SCOPED_STYLE_SYNTAXES: SelectorBan[] = Array.from(
  ownAttributesTagNamesMap,
  ([ownAttributes, tagNames]) => {
    const attributeNames = [
      ...(htmlElementAttributes["*"] ?? []),
      ...(ownAttributes ? ownAttributes.split(",") : []),
      ...VUE_RESERVED_ATTRIBUTE_NAMES,
      "role",
    ];
    const knownAttributeRegex = `/^(?:${attributeNames.join("|")}|aria-.*|data-.*)$/i`;
    return {
      message: MESSAGE,
      selector: `VElement[rawName=/^(?:${tagNames.join("|")})$/]:not(${FOREIGN_ROOT_SELECTOR} VElement:not(${FOREIGN_OBJECT_SELECTOR} VElement), ${FOREIGN_OBJECT_SELECTOR} ${FOREIGN_ROOT_SELECTOR} VElement) > VStartTag > VAttribute:matches([directive=false]:not([key.name=${knownAttributeRegex}]), [directive=true][key.name.name='bind'][key.argument.type='VIdentifier']:not([key.argument.name=${knownAttributeRegex}]))`,
    };
  },
);

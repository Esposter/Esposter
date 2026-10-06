import { defineConfig } from "eslint/config";
import { htmlElementAttributes } from "html-element-attributes";
import { htmlTagNames } from "html-tag-names";

// A package styled by scoped CSS has no UnoCSS to read an attribute as a utility, so an attribute the HTML standard
// Does not define on a native element (`size-full`, `flex`, `p="2"`) is inert: it styles nothing, and the element
// Takes the browser's defaults instead. Its scope is the construct's own domain, a native HTML element, told apart by
// The HTML namespace and the standard's tag names, and the attributes it accepts are the standard's own (global and
// Per element), WAI-ARIA's `role` and `aria-*`, custom data, and the two Vue keeps for itself. Vue's `<template>` and
// `<slot>` share HTML's names but are the framework's outlets, whose bound attributes are slot props
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const htmlTagNameSet = new Set(htmlTagNames);
const vueOutletNames = new Set(["slot", "template"]);
const vueReservedAttributeNames = new Set(["key", "ref"]);
const globalAttributeNames = new Set(htmlElementAttributes["*"]);

/** @param {string} elementName @param {string} attributeName */
const checkIsKnownAttribute = (elementName, attributeName) =>
  globalAttributeNames.has(attributeName) ||
  Boolean(htmlElementAttributes[elementName]?.includes(attributeName)) ||
  vueReservedAttributeNames.has(attributeName) ||
  attributeName === "role" ||
  attributeName.startsWith("aria-") ||
  attributeName.startsWith("data-");

/** @param {import("vue-eslint-parser").AST.VAttribute | import("vue-eslint-parser").AST.VDirective} attribute */
const getAttributeName = (attribute) => {
  if (!attribute.directive) return attribute.key.rawName.toLowerCase();
  // Only a bound attribute with a static name sets an attribute; every other directive is Vue's
  const { argument, name } = attribute.key;
  return name.name === "bind" && argument?.type === "VIdentifier" ? argument.rawName.toLowerCase() : "";
};

/** @type {import("eslint").Rule.RuleModule} */
const noUnknownAttribute = {
  create: (context) =>
    context.sourceCode.parserServices.defineTemplateBodyVisitor?.({
      /** @param {import("vue-eslint-parser").AST.VElement} element */
      VElement: (element) => {
        if (
          element.namespace !== HTML_NAMESPACE ||
          !htmlTagNameSet.has(element.name) ||
          vueOutletNames.has(element.name)
        )
          return;
        for (const attribute of element.startTag.attributes) {
          const attributeName = getAttributeName(attribute);
          if (!attributeName || checkIsKnownAttribute(element.name, attributeName)) continue;
          context.report({
            loc: attribute.loc,
            message: `\`${attributeName}\` is no attribute of <${element.name}>: a package styled by scoped CSS generates no utility from it, so it styles nothing. Write the style in the component's scoped style block.`,
          });
        }
      },
    }) ?? {},
  meta: { type: "problem" },
};

export default defineConfig({
  files: ["**/*.vue"],
  plugins: { "scoped-styles": { rules: { "no-unknown-attribute": noUnknownAttribute } } },
  rules: { "scoped-styles/no-unknown-attribute": "error" },
});

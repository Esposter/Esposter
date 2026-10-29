import type { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import type { HtmlNode } from "#shared/models/pageBuilder/html/HtmlNode";
import type { RenderedDomOutputSpec } from "#shared/models/pageBuilder/text/RenderedDomOutputSpec";
import type { DOMOutputSpec } from "@tiptap/pm/model";

import { checkIsElementAttribute } from "#shared/services/pageBuilder/html/checkIsElementAttribute";
import { checkIsElementTag } from "#shared/services/pageBuilder/html/checkIsElementTag";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { createText } from "#shared/services/pageBuilder/html/createText";
import {
  checkIsAllowedUrl,
  checkIsPlainObject,
  DEFAULT_ALLOWED_SCHEMES,
  InvalidOperationError,
  Operation,
  URL_ATTRIBUTES,
} from "@esposter/shared";

// ProseMirror's DOMOutputSpec read into the element tree rather than the DOM, so a text node renders the same on the
// Server and in the canvas. An attribute outside the typed set drops out, and a URL the sanitiser refuses with it
export const renderDomOutputSpec = (spec: DOMOutputSpec): RenderedDomOutputSpec => {
  if (typeof spec === "string") return { node: createText(spec) };
  else if (!Array.isArray(spec) || typeof spec[0] !== "string" || !checkIsElementTag(spec[0]))
    throw new InvalidOperationError(Operation.Read, JSON.stringify(spec), "not an element the page can hold");

  const [tag, ...rest] = spec;
  const [attributes, contentSpecs] = checkIsPlainObject(rest[0]) ? [rest[0], rest.slice(1)] : [{}, rest];
  const children: HtmlNode[] = [];
  let hole: HtmlNode[] | undefined;
  for (const contentSpec of contentSpecs)
    if (contentSpec === 0) hole = children;
    else {
      const renderedSpec = renderDomOutputSpec(contentSpec);
      children.push(renderedSpec.node);
      hole ??= renderedSpec.hole;
    }

  const elementAttributes: Partial<Record<ElementAttribute, string>> = {};
  for (const [name, value] of Object.entries(attributes))
    if (
      checkIsElementAttribute(name) &&
      (typeof value === "string" || typeof value === "number") &&
      (!URL_ATTRIBUTES.includes(name) || checkIsAllowedUrl(String(value), DEFAULT_ALLOWED_SCHEMES))
    )
      elementAttributes[name] = String(value);
  return { hole, node: createElement(tag, elementAttributes, children) };
};

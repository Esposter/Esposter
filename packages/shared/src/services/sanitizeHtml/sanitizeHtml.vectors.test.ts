import type { DefaultTreeAdapterTypes } from "parse5";

import { DEFAULT_ALLOWED_TAGS, HTML_NAMESPACE } from "#src/services/sanitizeHtml/constants";
import { sanitizeHtml } from "#src/services/sanitizeHtml/sanitizeHtml";
import { jsonDateParse } from "#src/util/object/jsonDateParse";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaultTreeAdapter, parseFragment } from "parse5";
import { describe, expect, test } from "vitest";

// Every element of the output, read back the way a browser would read it, with its attributes
const getOutputElements = (output: string): DefaultTreeAdapterTypes.Element[] => {
  const context = defaultTreeAdapter.createElement("body", HTML_NAMESPACE, []);
  const elements: DefaultTreeAdapterTypes.Element[] = [];
  const visit = (nodes: DefaultTreeAdapterTypes.ChildNode[]): void => {
    for (const node of nodes) {
      if (!("tagName" in node)) continue;

      elements.push(node);
      visit(node.childNodes);
    }
  };
  visit(parseFragment(context, output, {}).childNodes);
  return elements;
};

describe(sanitizeHtml, () => {
  const DOMPURIFY_VECTORS = jsonDateParse<{ payload: string; title: string }[]>(
    readFileSync(resolve(import.meta.dirname, "../../test/domPurifyVectors.json"), "utf8"),
  );
  const ALLOWED_ATTRIBUTE_NAMES = new Set(["href", "name", "rel", "style", "target"]);

  // Every vector is one attack. The property holds for any of them, so the test asserts the policy's invariants on the
  // Output rather than an exact string, and the output is then sanitised again to show it is already stable
  test.each(DOMPURIFY_VECTORS.map(({ payload, title }) => [title, payload]))(
    "dompurify vector %s",
    (_title, payload) => {
      expect.hasAssertions();

      const output = sanitizeHtml(payload);
      for (const element of getOutputElements(output)) {
        expect(element.namespaceURI).toBe(HTML_NAMESPACE);
        expect(DEFAULT_ALLOWED_TAGS).toContain(element.tagName);
        expect(element.attrs.every(({ name }) => ALLOWED_ATTRIBUTE_NAMES.has(name))).toBe(true);
        expect(element.attrs.some(({ value }) => /javascript:|vbscript:/iu.test(value))).toBe(false);
      }
      expect(sanitizeHtml(output)).toBe(output);
    },
  );
});

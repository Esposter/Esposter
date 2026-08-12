import type { z } from "zod";

import { EmailEditor, emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { grapesJsEditorSchema } from "#shared/models/grapesjs/AGrapesJsEditor";
import { WebpageEditor, webpageEditorSchema } from "#shared/models/webpageEditor/data/WebpageEditor";
import { describe, expect, test } from "vitest";

// A GrapesJS project carries far more than the models name — styles, assets, symbols, dataSources — which is
// What the base schema's catchall is for. A subclass schema is built by spreading `.shape`, and a spread copies
// Fields and nothing else, so each one has to re-declare the catchall or it silently drops the editor's state
describe("grapesJs editor schemas", () => {
  const grapesJsState = { assets: [{ src: "https://example.com/a.png" }], styles: [{ selectors: ["a"] }] };
  const editorSchemas: [string, z.ZodType, object][] = [
    ["grapesJsEditorSchema", grapesJsEditorSchema, structuredClone(new WebpageEditor())],
    ["emailEditorSchema", emailEditorSchema, structuredClone(new EmailEditor())],
    ["webpageEditorSchema", webpageEditorSchema, structuredClone(new WebpageEditor())],
  ];

  test.each(editorSchemas)("%s keeps the keys it does not name", (_name, schema, editor) => {
    expect.hasAssertions();

    expect(schema.parse({ ...editor, ...grapesJsState })).toStrictEqual({ ...editor, ...grapesJsState });
  });
});

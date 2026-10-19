import type { MjmlDocument } from "mjml-blocks";

import { compileEmailDocument } from "#server/services/emailEditor/compileEmailDocument";
import { TEST_CONTEXT, TEST_LABEL } from "#shared/services/pageBuilder/constants.test";
import { noop } from "@esposter/shared";
import { MjmlNodeType } from "mjml-blocks";
import { describe, expect, test } from "vitest";

describe(compileEmailDocument, () => {
  test("an email document with invalid markup is refused by the compile", async () => {
    expect.hasAssertions();

    const document: MjmlDocument = {
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: { content: TEST_LABEL, id: crypto.randomUUID(), padding: "1px 2px 3px 4px 5px" },
                      type: MjmlNodeType.Button,
                    },
                  ],
                  id: crypto.randomUUID(),
                },
                type: MjmlNodeType.Column,
              },
            ],
            id: crypto.randomUUID(),
          },
          type: MjmlNodeType.Section,
        },
      ],
      root: { props: {} },
    };

    await compileEmailDocument(document, TEST_CONTEXT).match(noop, (error) => {
      expect(error.message).toMatchInlineSnapshot(`
        "ValidationError: 
         Line undefined of undefined (mj-button) — Attribute padding has invalid value: 1px 2px 3px 4px 5px for type Unit, only accepts (px, %) units and 1 to 4 value(s)"
      `);
    });
  });

  test("a valid email document compiles to email HTML", async () => {
    expect.hasAssertions();

    const document: MjmlDocument = {
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: {
                        content: {
                          content: [{ content: [{ text: TEST_LABEL, type: "text" }], type: "paragraph" }],
                          type: "doc",
                        },
                        id: crypto.randomUUID(),
                      },
                      type: MjmlNodeType.Text,
                    },
                  ],
                  id: crypto.randomUUID(),
                },
                type: MjmlNodeType.Column,
              },
            ],
            id: crypto.randomUUID(),
          },
          type: MjmlNodeType.Section,
        },
      ],
      root: { props: {} },
    };
    const html = await compileEmailDocument(document, TEST_CONTEXT).match(
      (compiledHtml) => compiledHtml,
      (error) => {
        throw error;
      },
    );

    expect(html).toMatch(/^<!doctype html>/iu);
  });
});

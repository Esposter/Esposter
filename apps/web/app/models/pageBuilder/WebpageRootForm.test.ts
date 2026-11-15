import { webpageRootFormSchema } from "#src/models/pageBuilder/WebpageRootForm";
import { zodToJsonSchema } from "#src/services/jsonSchema/zodToJsonSchema";
import { describe, expect, test } from "vitest";

describe("webpageRootFormSchema", () => {
  test("renders the language alone", () => {
    expect.hasAssertions();

    expect(zodToJsonSchema(webpageRootFormSchema)).toMatchInlineSnapshot(`
      {
        "additionalProperties": false,
        "properties": {
          "lang": {
            "maxLength": 35,
            "minLength": 1,
            "title": "Lang",
            "type": "string",
          },
        },
        "required": [
          "lang",
        ],
        "type": "object",
      }
    `);
  });
});

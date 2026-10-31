import { webpageRootFormSchema } from "@/models/pageBuilder/WebpageRootForm";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
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

import { mathOperationTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperationTransformation";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { describe, expect, test } from "vitest";

describe("mathOperationTransformation", () => {
  test("produces correct json schema for vjsf", () => {
    expect.hasAssertions();

    expect(zodToJsonSchema(mathOperationTransformationSchema)).toMatchInlineSnapshot(`
      {
        "additionalProperties": false,
        "properties": {
          "first": {
            "oneOf": [
              {
                "additionalProperties": false,
                "properties": {
                  "sourceColumnId": {
                    "comp": "select",
                    "getItems": "context.numberSourceColumnItems",
                    "layout": {
                      "comp": "select",
                      "getItems": "context.numberSourceColumnItems",
                    },
                    "title": "Column",
                    "type": "string",
                  },
                  "type": {
                    "const": "Column",
                    "readOnly": true,
                    "title": "Type",
                    "type": "string",
                  },
                },
                "required": [
                  "type",
                  "sourceColumnId",
                ],
                "title": "Column",
                "type": "object",
              },
              {
                "additionalProperties": false,
                "properties": {
                  "type": {
                    "const": "Constant",
                    "readOnly": true,
                    "title": "Type",
                    "type": "string",
                  },
                  "value": {
                    "title": "Value",
                    "type": "number",
                  },
                },
                "required": [
                  "type",
                  "value",
                ],
                "title": "Constant",
                "type": "object",
              },
            ],
            "title": "First",
          },
          "steps": {
            "default": [],
            "items": {
              "oneOf": [
                {
                  "additionalProperties": false,
                  "properties": {
                    "operation": {
                      "enum": [
                        "Absolute",
                        "Ceil",
                        "Floor",
                        "Round",
                      ],
                      "title": "Operation",
                      "type": "string",
                    },
                    "type": {
                      "const": "Unary",
                      "readOnly": true,
                      "type": "string",
                    },
                  },
                  "required": [
                    "type",
                    "operation",
                  ],
                  "title": "Unary",
                  "type": "object",
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "operand": {
                      "oneOf": [
                        {
                          "additionalProperties": false,
                          "properties": {
                            "sourceColumnId": {
                              "comp": "select",
                              "getItems": "context.numberSourceColumnItems",
                              "layout": {
                                "comp": "select",
                                "getItems": "context.numberSourceColumnItems",
                              },
                              "title": "Column",
                              "type": "string",
                            },
                            "type": {
                              "const": "Column",
                              "readOnly": true,
                              "type": "string",
                            },
                          },
                          "required": [
                            "type",
                            "sourceColumnId",
                          ],
                          "title": "Column",
                          "type": "object",
                        },
                        {
                          "additionalProperties": false,
                          "properties": {
                            "type": {
                              "const": "Constant",
                              "readOnly": true,
                              "type": "string",
                            },
                            "value": {
                              "title": "Value",
                              "type": "number",
                            },
                          },
                          "required": [
                            "type",
                            "value",
                          ],
                          "title": "Constant",
                          "type": "object",
                        },
                      ],
                      "title": "Operand",
                    },
                    "operation": {
                      "enum": [
                        "Add",
                        "Divide",
                        "Multiply",
                        "Subtract",
                      ],
                      "title": "Operation",
                      "type": "string",
                    },
                    "type": {
                      "const": "Binary",
                      "readOnly": true,
                      "type": "string",
                    },
                  },
                  "required": [
                    "type",
                    "operand",
                    "operation",
                  ],
                  "title": "Binary",
                  "type": "object",
                },
              ],
            },
            "title": "Steps",
            "type": "array",
          },
          "type": {
            "const": "MathOperation",
            "readOnly": true,
            "title": "Type",
            "type": "string",
          },
        },
        "required": [
          "type",
          "first",
          "steps",
        ],
        "title": "MathOperation",
        "type": "object",
      }
    `);
  });
});

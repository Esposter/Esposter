// @vitest-environment node
import { columnFormSchema } from "#shared/models/tableEditor/file/column/ColumnForm";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { describe, expect, test } from "vitest";

describe("columnFormSchema", () => {
  test("matches inline snapshot", () => {
    expect.hasAssertions();

    expect(zodToJsonSchema(columnFormSchema)).toMatchInlineSnapshot(`
      {
        "discriminator": {
          "propertyName": "type",
        },
        "oneOf": [
          {
            "additionalProperties": false,
            "properties": {
              "description": {
                "default": "",
                "maxLength": 1000,
                "title": "Description",
                "type": "string",
              },
              "format": {
                "enum": [
                  "OneZero",
                  "TrueFalse",
                  "YesNo",
                ],
                "title": "Format",
                "type": "string",
              },
              "name": {
                "errorMessage": {
                  "uniqueColumnName": "Column already exists",
                },
                "maxLength": 1000,
                "minLength": 1,
                "title": "Column",
                "type": "string",
                "uniqueColumnName": true,
              },
              "sourceName": {
                "default": "",
                "readOnly": true,
                "title": "Source Column",
                "type": "string",
              },
              "type": {
                "const": "Boolean",
                "readOnly": true,
                "title": "Type",
                "type": "string",
              },
            },
            "required": [
              "description",
              "name",
              "sourceName",
              "type",
            ],
            "title": "Boolean",
            "type": "object",
          },
          {
            "additionalProperties": false,
            "properties": {
              "description": {
                "default": "",
                "maxLength": 1000,
                "title": "Description",
                "type": "string",
              },
              "name": {
                "errorMessage": {
                  "uniqueColumnName": "Column already exists",
                },
                "maxLength": 1000,
                "minLength": 1,
                "title": "Column",
                "type": "string",
                "uniqueColumnName": true,
              },
              "sourceName": {
                "default": "",
                "readOnly": true,
                "title": "Source Column",
                "type": "string",
              },
              "transformation": {
                "discriminator": {
                  "propertyName": "type",
                },
                "oneOf": [
                  {
                    "additionalProperties": false,
                    "properties": {
                      "aggregationTransformationType": {
                        "enum": [
                          "Average",
                          "Count",
                          "Maximum",
                          "Minimum",
                          "PercentOfTotal",
                          "Rank",
                          "RunningSummation",
                        ],
                        "title": "Aggregation",
                        "type": "string",
                      },
                      "sourceColumnId": {
                        "layout": {
                          "comp": "select",
                          "getItems": "context.numberColumnItems",
                        },
                        "title": "Source Column",
                        "type": "string",
                      },
                      "type": {
                        "const": "Aggregation",
                        "readOnly": true,
                        "title": "Type",
                        "type": "string",
                      },
                    },
                    "required": [
                      "type",
                      "sourceColumnId",
                      "aggregationTransformationType",
                    ],
                    "title": "Aggregation",
                    "type": "object",
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "sourceColumnId": {
                        "layout": {
                          "comp": "select",
                          "getItems": "context.columnItems",
                        },
                        "title": "Source Column",
                        "type": "string",
                      },
                      "targetType": {
                        "enum": [
                          "Boolean",
                          "Date",
                          "Number",
                          "String",
                        ],
                        "title": "Target Type",
                        "type": "string",
                      },
                      "type": {
                        "const": "ConvertTo",
                        "readOnly": true,
                        "title": "Type",
                        "type": "string",
                      },
                    },
                    "required": [
                      "type",
                      "sourceColumnId",
                      "targetType",
                    ],
                    "title": "Convert To",
                    "type": "object",
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "part": {
                        "enum": [
                          "Day",
                          "Hour",
                          "Minute",
                          "Month",
                          "Weekday",
                          "Year",
                        ],
                        "title": "Part",
                        "type": "string",
                      },
                      "sourceColumnId": {
                        "layout": {
                          "comp": "select",
                          "getItems": "context.dateColumnItems",
                        },
                        "title": "Source Column",
                        "type": "string",
                      },
                      "type": {
                        "const": "DatePart",
                        "readOnly": true,
                        "title": "Type",
                        "type": "string",
                      },
                    },
                    "required": [
                      "type",
                      "sourceColumnId",
                      "part",
                    ],
                    "title": "Date Part",
                    "type": "object",
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "expression": {
                        "title": "Expression",
                        "type": "string",
                      },
                      "type": {
                        "const": "Math",
                        "readOnly": true,
                        "title": "Type",
                        "type": "string",
                      },
                      "variables": {
                        "items": {
                          "additionalProperties": false,
                          "properties": {
                            "name": {
                              "maxLength": 1000,
                              "minLength": 1,
                              "title": "Name",
                              "type": "string",
                            },
                            "sourceColumnId": {
                              "layout": {
                                "comp": "select",
                                "getItems": "context.numberColumnItems",
                              },
                              "title": "Source Column",
                              "type": "string",
                            },
                          },
                          "required": [
                            "name",
                            "sourceColumnId",
                          ],
                          "type": "object",
                        },
                        "title": "Variables",
                        "type": "array",
                      },
                    },
                    "required": [
                      "type",
                      "expression",
                      "variables",
                    ],
                    "title": "Math",
                    "type": "object",
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "groupIndex": {
                        "maximum": 9007199254740991,
                        "minimum": 0,
                        "title": "Group Index",
                        "type": "integer",
                      },
                      "pattern": {
                        "title": "Pattern",
                        "type": "string",
                      },
                      "sourceColumnId": {
                        "layout": {
                          "comp": "select",
                          "getItems": "context.stringColumnItems",
                        },
                        "title": "Source Column",
                        "type": "string",
                      },
                      "type": {
                        "const": "RegexMatch",
                        "readOnly": true,
                        "title": "Type",
                        "type": "string",
                      },
                    },
                    "required": [
                      "type",
                      "sourceColumnId",
                      "groupIndex",
                      "pattern",
                    ],
                    "title": "Regex Match",
                    "type": "object",
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "pattern": {
                        "title": "Pattern",
                        "type": "string",
                      },
                      "sourceColumnIds": {
                        "items": {
                          "type": "string",
                        },
                        "layout": {
                          "getItems": "context.columnItems",
                        },
                        "title": "Source Columns",
                        "type": "array",
                      },
                      "type": {
                        "const": "StringPattern",
                        "readOnly": true,
                        "title": "Type",
                        "type": "string",
                      },
                    },
                    "required": [
                      "type",
                      "sourceColumnIds",
                      "pattern",
                    ],
                    "title": "String Pattern",
                    "type": "object",
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "delimiter": {
                        "title": "Delimiter",
                        "type": "string",
                      },
                      "segmentIndex": {
                        "maximum": 9007199254740991,
                        "minimum": 0,
                        "title": "Segment Index",
                        "type": "integer",
                      },
                      "sourceColumnId": {
                        "layout": {
                          "comp": "select",
                          "getItems": "context.stringColumnItems",
                        },
                        "title": "Source Column",
                        "type": "string",
                      },
                      "type": {
                        "const": "StringSplit",
                        "readOnly": true,
                        "title": "Type",
                        "type": "string",
                      },
                    },
                    "required": [
                      "type",
                      "sourceColumnId",
                      "delimiter",
                      "segmentIndex",
                    ],
                    "title": "String Split",
                    "type": "object",
                  },
                  {
                    "additionalProperties": false,
                    "properties": {
                      "sourceColumnId": {
                        "layout": {
                          "comp": "select",
                          "getItems": "context.stringColumnItems",
                        },
                        "title": "Source Column",
                        "type": "string",
                      },
                      "stringTransformationType": {
                        "enum": [
                          "Lowercase",
                          "TitleCase",
                          "Trim",
                          "Uppercase",
                        ],
                        "title": "String Transformation Type",
                        "type": "string",
                      },
                      "type": {
                        "const": "String",
                        "readOnly": true,
                        "title": "Type",
                        "type": "string",
                      },
                    },
                    "required": [
                      "type",
                      "sourceColumnId",
                      "stringTransformationType",
                    ],
                    "title": "String",
                    "type": "object",
                  },
                ],
                "title": "Transformation",
              },
              "type": {
                "const": "Computed",
                "readOnly": true,
                "title": "Type",
                "type": "string",
              },
            },
            "required": [
              "description",
              "name",
              "sourceName",
              "type",
              "transformation",
            ],
            "title": "Computed",
            "type": "object",
          },
          {
            "additionalProperties": false,
            "properties": {
              "description": {
                "default": "",
                "maxLength": 1000,
                "title": "Description",
                "type": "string",
              },
              "format": {
                "enum": [
                  "D/M/YYYY",
                  "DD/MM/YYYY",
                  "M/D/YYYY",
                  "MM/DD/YYYY",
                  "YYYY/MM/DD",
                  "DD-MM-YYYY",
                  "MM-DD-YYYY",
                  "YYYY-MM-DD",
                  "YYYY-MM-DDTHH:mm:ss",
                  "YYYY-MM-DDTHH:mm:ssZ",
                ],
                "title": "Format",
                "type": "string",
              },
              "name": {
                "errorMessage": {
                  "uniqueColumnName": "Column already exists",
                },
                "maxLength": 1000,
                "minLength": 1,
                "title": "Column",
                "type": "string",
                "uniqueColumnName": true,
              },
              "sourceName": {
                "default": "",
                "readOnly": true,
                "title": "Source Column",
                "type": "string",
              },
              "type": {
                "const": "Date",
                "readOnly": true,
                "title": "Type",
                "type": "string",
              },
            },
            "required": [
              "description",
              "name",
              "sourceName",
              "type",
              "format",
            ],
            "title": "Date",
            "type": "object",
          },
          {
            "additionalProperties": false,
            "properties": {
              "description": {
                "default": "",
                "maxLength": 1000,
                "title": "Description",
                "type": "string",
              },
              "format": {
                "enum": [
                  "Compact",
                  "Currency",
                  "Percentage",
                  "Plain",
                  "Scientific",
                ],
                "title": "Format",
                "type": "string",
              },
              "name": {
                "errorMessage": {
                  "uniqueColumnName": "Column already exists",
                },
                "maxLength": 1000,
                "minLength": 1,
                "title": "Column",
                "type": "string",
                "uniqueColumnName": true,
              },
              "sourceName": {
                "default": "",
                "readOnly": true,
                "title": "Source Column",
                "type": "string",
              },
              "type": {
                "const": "Number",
                "readOnly": true,
                "title": "Type",
                "type": "string",
              },
            },
            "required": [
              "description",
              "name",
              "sourceName",
              "type",
            ],
            "title": "Number",
            "type": "object",
          },
          {
            "additionalProperties": false,
            "properties": {
              "description": {
                "default": "",
                "maxLength": 1000,
                "title": "Description",
                "type": "string",
              },
              "name": {
                "errorMessage": {
                  "uniqueColumnName": "Column already exists",
                },
                "maxLength": 1000,
                "minLength": 1,
                "title": "Column",
                "type": "string",
                "uniqueColumnName": true,
              },
              "sourceName": {
                "default": "",
                "readOnly": true,
                "title": "Source Column",
                "type": "string",
              },
              "type": {
                "const": "String",
                "readOnly": true,
                "title": "Type",
                "type": "string",
              },
            },
            "required": [
              "description",
              "name",
              "sourceName",
              "type",
            ],
            "title": "String",
            "type": "object",
          },
        ],
      }
    `);
  });
});

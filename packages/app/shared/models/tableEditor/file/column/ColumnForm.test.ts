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
                "getProps": "{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }",
                "layout": {
                  "getProps": "{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }",
                },
                "maxLength": 1000,
                "minLength": 1,
                "title": "Column",
                "type": "string",
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
              "format": {
                "oneOf": [
                  {
                    "enum": [
                      "OneZero",
                      "TrueFalse",
                      "YesNo",
                    ],
                    "type": "string",
                  },
                  {
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
                    "type": "string",
                  },
                  {
                    "enum": [
                      "Compact",
                      "Currency",
                      "Percentage",
                      "Plain",
                      "Scientific",
                    ],
                    "type": "string",
                  },
                ],
                "title": "Format",
              },
              "name": {
                "getProps": "{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }",
                "layout": {
                  "getProps": "{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }",
                },
                "maxLength": 1000,
                "minLength": 1,
                "title": "Column",
                "type": "string",
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
                    "applicableColumnTypes": [
                      "Number",
                    ],
                    "properties": {
                      "aggregationTransformationType": {
                        "enum": [
                          "PercentOfTotal",
                          "Rank",
                          "RunningSum",
                        ],
                        "title": "Aggregation",
                        "type": "string",
                      },
                      "sourceColumnId": {
                        "comp": "select",
                        "getItems": "context.numberColumnItems",
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
                        "comp": "select",
                        "getItems": "context.columnItems",
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
                    "applicableColumnTypes": [
                      "Date",
                    ],
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
                        "comp": "select",
                        "getItems": "context.dateColumnItems",
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
                              "comp": "select",
                              "getItems": "context.numberColumnItems",
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
                    "applicableColumnTypes": [
                      "String",
                    ],
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
                        "comp": "select",
                        "getItems": "context.stringColumnItems",
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
                    "discriminator": {
                      "propertyName": "stringTransformationType",
                    },
                    "oneOf": [
                      {
                        "additionalProperties": false,
                        "applicableColumnTypes": [
                          "String",
                        ],
                        "properties": {
                          "sourceColumnId": {
                            "comp": "select",
                            "getItems": "context.stringColumnItems",
                            "layout": {
                              "comp": "select",
                              "getItems": "context.stringColumnItems",
                            },
                            "title": "Source Column",
                            "type": "string",
                          },
                          "stringTransformationType": {
                            "const": "Lowercase",
                            "title": "String Transformation",
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
                        "type": "object",
                      },
                      {
                        "additionalProperties": false,
                        "applicableColumnTypes": [
                          "String",
                        ],
                        "properties": {
                          "sourceColumnId": {
                            "comp": "select",
                            "getItems": "context.stringColumnItems",
                            "layout": {
                              "comp": "select",
                              "getItems": "context.stringColumnItems",
                            },
                            "title": "Source Column",
                            "type": "string",
                          },
                          "stringTransformationType": {
                            "const": "TitleCase",
                            "title": "String Transformation",
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
                        "type": "object",
                      },
                      {
                        "additionalProperties": false,
                        "applicableColumnTypes": [
                          "String",
                        ],
                        "properties": {
                          "sourceColumnId": {
                            "comp": "select",
                            "getItems": "context.stringColumnItems",
                            "layout": {
                              "comp": "select",
                              "getItems": "context.stringColumnItems",
                            },
                            "title": "Source Column",
                            "type": "string",
                          },
                          "stringTransformationType": {
                            "const": "Trim",
                            "title": "String Transformation",
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
                        "type": "object",
                      },
                      {
                        "additionalProperties": false,
                        "applicableColumnTypes": [
                          "String",
                        ],
                        "properties": {
                          "sourceColumnId": {
                            "comp": "select",
                            "getItems": "context.stringColumnItems",
                            "layout": {
                              "comp": "select",
                              "getItems": "context.stringColumnItems",
                            },
                            "title": "Source Column",
                            "type": "string",
                          },
                          "stringTransformationType": {
                            "const": "Uppercase",
                            "title": "String Transformation",
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
                        "type": "object",
                      },
                      {
                        "additionalProperties": false,
                        "applicableColumnTypes": [
                          "String",
                        ],
                        "properties": {
                          "pattern": {
                            "title": "Pattern",
                            "type": "string",
                          },
                          "sourceColumnIds": {
                            "items": {
                              "additionalProperties": false,
                              "comp": "select",
                              "getItems": "context.columnItems",
                              "layout": {
                                "comp": "select",
                                "getItems": "context.columnItems",
                              },
                              "title": "Source Column",
                              "type": "string",
                            },
                            "title": "Source Columns",
                            "type": "array",
                          },
                          "stringTransformationType": {
                            "const": "Interpolate",
                            "readOnly": true,
                            "title": "String Transformation",
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
                          "sourceColumnIds",
                          "pattern",
                          "stringTransformationType",
                        ],
                        "title": "Interpolate",
                        "type": "object",
                      },
                    ],
                    "title": "String",
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
                "getProps": "{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }",
                "layout": {
                  "getProps": "{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }",
                },
                "maxLength": 1000,
                "minLength": 1,
                "title": "Column",
                "type": "string",
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
                "getProps": "{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }",
                "layout": {
                  "getProps": "{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }",
                },
                "maxLength": 1000,
                "minLength": 1,
                "title": "Column",
                "type": "string",
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
                "getProps": "{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }",
                "layout": {
                  "getProps": "{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }",
                },
                "maxLength": 1000,
                "minLength": 1,
                "title": "Column",
                "type": "string",
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

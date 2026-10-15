import { ContentTypes } from "#src/services/azure/search/ContentTypes";
import { filtersToClauses } from "#src/services/azure/search/filtersToClauses";
import { BinaryOperator, CompositeKeyPropertyNames, SearchOperator, serializeValue } from "@esposter/azure";
import {
  FileEntityPropertyNames,
  FilterType,
  FilterTypeAuthorType,
  FilterTypeHas,
  getMimeCategory,
  MessageType,
  MimeCategory,
  StandardMessageEntityPropertyNames,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(filtersToClauses, () => {
  const value = "";
  const otherValue = " ";
  const mimetypeKey = `${StandardMessageEntityPropertyNames.files}/${FileEntityPropertyNames.mimetype}`;

  test("narrows one field per filter type", () => {
    expect.hasAssertions();

    expect(
      filtersToClauses([
        { type: FilterType.From, value },
        { type: FilterType.In, value },
        { type: FilterType.Before, value },
        { type: FilterType.After, value },
      ]),
    ).toStrictEqual([
      { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.Eq, value },
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value },
      { key: StandardMessageEntityPropertyNames.createdAt, operator: BinaryOperator.Lt, value },
      { key: StandardMessageEntityPropertyNames.createdAt, operator: BinaryOperator.Gt, value },
    ]);
  });

  test.each([
    [FilterTypeAuthorType.User, BinaryOperator.Ne],
    [FilterTypeAuthorType.Webhook, BinaryOperator.Eq],
  ] as const)("%s narrows messages by author type", (authorType, operator) => {
    expect.hasAssertions();

    expect(filtersToClauses([{ type: FilterType.AuthorType, value: authorType }])).toStrictEqual([
      { key: StandardMessageEntityPropertyNames.type, operator, value: MessageType.Webhook },
    ]);
  });

  test(`${FilterType.AuthorType} rejects a value no picker could have chosen`, () => {
    expect.hasAssertions();

    expect(() => filtersToClauses([{ type: FilterType.AuthorType, value: "Bot" }])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, filtersToClauses.name, serializeValue("Bot")).message}]`,
    );
  });

  // Any attachment at all is the collection being non-empty rather than any value in it, which is the one clause
  // With nothing to compare against
  test(`${FilterTypeHas.File} tests the attachment collection for being non-empty`, () => {
    expect.hasAssertions();

    expect(filtersToClauses([{ type: FilterType.Has, value: FilterTypeHas.File }])).toStrictEqual([
      { key: StandardMessageEntityPropertyNames.files, operator: SearchOperator.ArrayAny },
    ]);
  });

  // Filters are not unique by type — Azure Search takes one clause per filter, so a second `from:` or `has:`
  // Narrows alongside the first rather than replacing it, and `Mentions` collects its values into one clause
  test("gives every filter of one type its own clause", () => {
    expect.hasAssertions();

    expect(
      filtersToClauses([
        { type: FilterType.From, value },
        { type: FilterType.From, value: otherValue },
        { type: FilterType.Mentions, value },
        { type: FilterType.Mentions, value: otherValue },
      ]),
    ).toStrictEqual([
      { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.Eq, value },
      { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.Eq, value: otherValue },
      {
        key: StandardMessageEntityPropertyNames.mentions,
        operator: SearchOperator.ArrayContains,
        value: [value, otherValue],
      },
    ]);
  });

  // Every media filter must offer exactly the content types the uploader would categorise the same way, so the
  // Expectation is derived from getMimeCategory rather than restating a prefix filter of its own
  test.each([
    [FilterTypeHas.Image, MimeCategory.Image],
    [FilterTypeHas.Sound, MimeCategory.Audio],
    [FilterTypeHas.Video, MimeCategory.Video],
  ] as const)("%s matches every content type of the %s mime category", (filterTypeHas, mimeCategory) => {
    expect.hasAssertions();

    expect(takeOne(filtersToClauses([{ type: FilterType.Has, value: filterTypeHas }]), 0)).toStrictEqual({
      key: mimetypeKey,
      operator: SearchOperator.ArrayContains,
      value: [...ContentTypes].filter((contentType) => getMimeCategory(contentType) === mimeCategory),
    });
  });
});

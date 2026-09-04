import { ContentTypes } from "#src/models/ContentTypes";
import { filtersToClauses } from "#src/services/azure/search/filtersToClauses";
import { BinaryOperator, CompositeKeyPropertyNames, SearchOperator } from "@esposter/azure";
import {
  FileEntityPropertyNames,
  FilterType,
  FilterTypeHas,
  getMimeCategory,
  MimeCategory,
  StandardMessageEntityPropertyNames,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
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
      { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.eq, value },
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value },
      { key: StandardMessageEntityPropertyNames.createdAt, operator: BinaryOperator.lt, value },
      { key: StandardMessageEntityPropertyNames.createdAt, operator: BinaryOperator.gt, value },
    ]);
  });

  // Any attachment at all is the collection being non-empty rather than any value in it, which is the one clause
  // With nothing to compare against
  test(`${FilterTypeHas.File} tests the attachment collection for being non-empty`, () => {
    expect.hasAssertions();

    expect(filtersToClauses([{ type: FilterType.Has, value: FilterTypeHas.File }])).toStrictEqual([
      { key: StandardMessageEntityPropertyNames.files, operator: SearchOperator.arrayAny },
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
      { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.eq, value },
      { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.eq, value: otherValue },
      {
        key: StandardMessageEntityPropertyNames.mentions,
        operator: SearchOperator.arrayContains,
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
      operator: SearchOperator.arrayContains,
      value: [...ContentTypes].filter((contentType) => getMimeCategory(contentType) === mimeCategory),
    });
  });
});

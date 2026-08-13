import { ContentTypes } from "@/models/ContentType";
import { filtersToClauses } from "@/services/azure/search/filtersToClauses";
import {
  BinaryOperator,
  CompositeKeyPropertyNames,
  FileEntityPropertyNames,
  FilterType,
  FilterTypeHas,
  getMimeCategory,
  MimeCategory,
  SearchOperator,
  StandardMessageEntityPropertyNames,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(filtersToClauses, () => {
  const value = "";
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

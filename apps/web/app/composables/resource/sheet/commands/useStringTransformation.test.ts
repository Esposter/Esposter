// @vitest-environment nuxt
import { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { describe, expect, test } from "vitest";

describe(useStringTransformation, () => {
  setupCommandTest();

  test(`${StringTransformationType.Trim} strips whitespace from all string cells`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": " ", " ": " " }), createRow({ "": " ", " ": " " })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    await stringTransformation(StringTransformationType.Trim);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([
      { "": "", " ": "" },
      { "": "", " ": "" },
    ]);
  });

  test(`${StringTransformationType.LowerCase} lowercases all string cells`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": "A" })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    await stringTransformation(StringTransformationType.LowerCase);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ "": "a" }]);
  });

  test(`${StringTransformationType.UpperCase} uppercases all string cells`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": "a" })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    await stringTransformation(StringTransformationType.UpperCase);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ "": "A" }]);
  });

  test(`${StringTransformationType.TitleCase} title-cases all string cells`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": "a b" })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    await stringTransformation(StringTransformationType.TitleCase);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ "": "A B" }]);
  });

  test("no-op when no string cell changes", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": null })]);
    setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    await stringTransformation(StringTransformationType.Trim);

    expect(isUndoable.value).toBe(false);
  });

  test("description includes the transform", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": " " })]);
    setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undoDescription } = storeToRefs(sheetHistoryStore);
    await stringTransformation(StringTransformationType.Trim);

    expect(undoDescription.value).toBe(`Format Strings (${StringTransformationType.Trim})`);
  });
});

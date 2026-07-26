import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { getDataSourceTypeByFileName } from "@/services/resource/sheet/dataSource/getDataSourceTypeByFileName";
import { describe, expect, test } from "vitest";

describe(getDataSourceTypeByFileName, () => {
  const name = "name";

  test("resolves every format the map accepts", () => {
    expect.hasAssertions();

    expect(getDataSourceTypeByFileName(`${name}.csv`)).toBe(DataSourceType.Csv);
    expect(getDataSourceTypeByFileName(`${name}.json`)).toBe(DataSourceType.Json);
    expect(getDataSourceTypeByFileName(`${name}.xlsx`)).toBe(DataSourceType.Xlsx);
  });

  test("resolves an uppercased extension", () => {
    expect.hasAssertions();

    expect(getDataSourceTypeByFileName(`${name}.CSV`)).toBe(DataSourceType.Csv);
  });

  test("resolves by the last extension of a multi-dotted name", () => {
    expect.hasAssertions();

    expect(getDataSourceTypeByFileName(`${name}.csv.json`)).toBe(DataSourceType.Json);
  });

  test("resolves nothing for an unsupported or absent extension", () => {
    expect.hasAssertions();

    expect(getDataSourceTypeByFileName(`${name}.txt`)).toBeUndefined();
    expect(getDataSourceTypeByFileName(name)).toBeUndefined();
  });
});

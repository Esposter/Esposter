import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { randomUUID } from "node:crypto";
import { describe, expect, test } from "vitest";

describe(useDataMap, () => {
  const id = randomUUID();
  const otherId = randomUUID();

  test("stores data per id", () => {
    expect.hasAssertions();

    const currentId = ref(id);
    const { data } = useDataMap(currentId, "");
    data.value = " ";
    currentId.value = otherId;

    expect(data.value).toBe("");

    currentId.value = id;

    expect(data.value).toBe(" ");
  });

  test("clones a plain default value so keys never share state", () => {
    expect.hasAssertions();

    const currentId = ref(id);
    const { data } = useDataMap<string[]>(currentId, []);
    data.value.push("");
    currentId.value = otherId;

    expect(data.value).toStrictEqual([]);
  });

  test("calls a factory default value so class instances keep their prototype", () => {
    expect.hasAssertions();

    const { data } = useDataMap(ref(id), () => new CursorPaginationData());

    expect(data.value).toBeInstanceOf(CursorPaginationData);
  });
});

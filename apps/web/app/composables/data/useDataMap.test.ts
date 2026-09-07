import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { describe, expect, test } from "vitest";

describe(useDataMap, () => {
  const id = crypto.randomUUID();
  const otherId = crypto.randomUUID();

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

  // An operation resolves every slice it writes back when it is issued, so a response that lands after the key
  // Has moved on is still filed where it belongs rather than over whatever is on screen
  test("keeps writing to the key a bound ref was bound at", () => {
    expect.hasAssertions();

    const currentId = ref(id);
    const { data, getBoundData } = useDataMap(currentId, "");
    const boundData = getBoundData();
    currentId.value = otherId;
    boundData.value = " ";

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

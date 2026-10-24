import { useNumberSelect } from "@/composables/message/shared/useNumberSelect";
import { describe, expect, test } from "vitest";

describe(useNumberSelect, () => {
  const items = [
    { title: "1 minute", value: 60 },
    { title: "1 hour", value: 3600 },
  ];

  test("reads the selected number as its string", () => {
    expect.hasAssertions();

    const selected = ref(3600);

    expect(useNumberSelect(selected, items).value).toBe("3600");
  });

  test("writes the number of the chosen option back, and leaves the selection as it was for an option not offered", () => {
    expect.hasAssertions();

    const selected = ref(60);
    const selectNumber = useNumberSelect(selected, items);
    selectNumber.value = "3600";
    expect(selected.value).toBe(3600);

    selectNumber.value = "5";
    expect(selected.value).toBe(3600);
  });
});

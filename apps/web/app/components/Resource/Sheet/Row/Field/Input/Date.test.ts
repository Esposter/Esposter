// @vitest-environment nuxt
import { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";
import { formatDate } from "#shared/util/date/formatDate";
import ResourceSheetRowFieldInputDate from "@/components/Resource/Sheet/Row/Field/Input/Date.vue";
import { getZonedDateTime } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

// A day of the grid, found by the ISO date it carries
const getDaySelector = (isoDate: string) => `[data-date="${isoDate}"]`;

describe("resourceSheetRowFieldInputDate", () => {
  const column = new DateColumn();
  const epoch = new Date(0);
  const nextDay = getZonedDateTime(epoch).toPlainDate().add({ days: 1 });

  test("writes the day chosen in the column's own format", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSheetRowFieldInputDate, {
      props: { column, modelValue: formatDate(epoch, column.format) },
    });
    await component.get(getDaySelector(nextDay.toString())).trigger("click");

    expect(component.emitted("update:modelValue")).toStrictEqual([
      [formatDate(new Date(getZonedDateTime(epoch).add({ days: 1 }).epochMilliseconds), column.format)],
    ]);
  });

  test("empties the cell on its clear button", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSheetRowFieldInputDate, {
      props: { column, modelValue: formatDate(epoch, column.format) },
    });
    await component.get(`[aria-label="Clear ${column.name}"]`).trigger("click");

    expect(component.emitted("update:modelValue")).toStrictEqual([[null]]);
  });
});

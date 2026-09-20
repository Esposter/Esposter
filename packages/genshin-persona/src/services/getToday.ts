import type { Today } from "#src/models/Today";

const ISO_DATE_PART_LENGTH = 2;

// The machine's local calendar day: a birthday is a local fact, and midnight is the local one
export const getToday = (): Today => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const paddedMonth = String(month).padStart(ISO_DATE_PART_LENGTH, "0");
  const paddedDay = String(day).padStart(ISO_DATE_PART_LENGTH, "0");
  return { isoDate: `${now.getFullYear()}-${paddedMonth}-${paddedDay}`, monthDay: { day, month } };
};

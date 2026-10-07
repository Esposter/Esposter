// A pass's reading or gate as the report and the command print it: a whole number as it is, any other to four places
export const formatPassValue = (value: number): string => (Number.isInteger(value) ? String(value) : value.toFixed(4));

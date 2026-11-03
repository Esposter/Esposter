const pad = (value: number, length: number): string => String(value).padStart(length, "0");

// A local midnight is written as its date alone, the form a date answer takes, so a result compares with an answer.
// Any other moment keeps its time, in local time with no offset, which parseSurveyLogicDate reads back to the same moment
export const toSurveyLogicDate = (date: Date): string | undefined => {
  if (Number.isNaN(date.getTime())) return undefined;

  const datePart = `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}`;

  if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0)
    return datePart;

  return `${datePart}T${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(date.getSeconds(), 2)}.${pad(date.getMilliseconds(), 3)}`;
};

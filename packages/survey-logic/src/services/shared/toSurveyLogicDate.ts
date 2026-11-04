const pad = (value: number, length: number): string => String(value).padStart(length, "0");

// A wall-clock midnight is written as its date alone, the form a date answer takes, so a result compares with an answer.
// Any other moment keeps its time, which parseSurveyLogicDate reads back to the same wall clock. A year past the four digits a
// Date text holds, from zero to 9999, has no text, so a date outside them has no result
export const toSurveyLogicDate = (wallClock: Date): string | undefined => {
  if (Number.isNaN(wallClock.getTime())) return undefined;

  const year = wallClock.getUTCFullYear();
  if (year < 0 || year > 9999) return undefined;

  const datePart = `${pad(year, 4)}-${pad(wallClock.getUTCMonth() + 1, 2)}-${pad(wallClock.getUTCDate(), 2)}`;
  if (
    wallClock.getUTCHours() === 0 &&
    wallClock.getUTCMinutes() === 0 &&
    wallClock.getUTCSeconds() === 0 &&
    wallClock.getUTCMilliseconds() === 0
  )
    return datePart;

  return `${datePart}T${pad(wallClock.getUTCHours(), 2)}:${pad(wallClock.getUTCMinutes(), 2)}:${pad(wallClock.getUTCSeconds(), 2)}.${pad(wallClock.getUTCMilliseconds(), 3)}`;
};

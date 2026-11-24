// A wall-clock midnight is written as its date alone, the form a date answer takes.
// That lets a result compare with an answer.
// Any other moment keeps its time, which parseSurveyLogicDate reads back to the same wall clock.
// A year past the four digits a Date text holds, from zero to 9999, has no text, so a date outside them has no result.
export const toSurveyLogicDate = (wallClock: Date): string | undefined => {
  if (Number.isNaN(wallClock.getTime())) return undefined;

  const year = wallClock.getUTCFullYear();
  if (year < 0 || year > 9999) return undefined;

  const datePart = `${String(year).padStart(4, "0")}-${String(wallClock.getUTCMonth() + 1).padStart(2, "0")}-${String(wallClock.getUTCDate()).padStart(2, "0")}`;
  if (
    wallClock.getUTCHours() === 0 &&
    wallClock.getUTCMinutes() === 0 &&
    wallClock.getUTCSeconds() === 0 &&
    wallClock.getUTCMilliseconds() === 0
  )
    return datePart;

  return `${datePart}T${String(wallClock.getUTCHours()).padStart(2, "0")}:${String(wallClock.getUTCMinutes()).padStart(2, "0")}:${String(wallClock.getUTCSeconds()).padStart(2, "0")}.${String(wallClock.getUTCMilliseconds()).padStart(3, "0")}`;
};

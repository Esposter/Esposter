// A repeated command's letter is left out, and so is a lineto after a moveto, which the moveto's own pairs imply
export const checkImplicit = (previousLetter: string, letter: string): boolean =>
  letter !== "m" && letter !== "z" && (letter === previousLetter || (previousLetter === "m" && letter === "l"));

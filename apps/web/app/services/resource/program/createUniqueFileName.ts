import { sanitizeFilename } from "@/services/app/sanitizeFilename";

// Key values are unique per program, but sanitizing can map two of them to one name ("12/3" and "12-3").
// A name already taken gets a counter rather than replacing the participant who has it
export const createUniqueFileName = (keyValue: string, takenFileNames: Set<string>) => {
  const sanitizedName = sanitizeFilename(keyValue);
  let fileName = sanitizedName;
  for (let suffix = 2; takenFileNames.has(fileName); suffix += 1) fileName = `${sanitizedName}-${suffix}`;
  takenFileNames.add(fileName);
  return fileName;
};

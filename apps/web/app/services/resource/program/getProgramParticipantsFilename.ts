import { sanitizeFilename } from "@/services/app/sanitizeFilename";

// The participant links file the owner sends from, named after the program it belongs to
export const getProgramParticipantsFilename = (resourceName: string) =>
  `${sanitizeFilename(resourceName)}-participants.csv`;

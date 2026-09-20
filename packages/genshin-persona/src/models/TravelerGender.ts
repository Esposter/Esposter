// The two player twins, as the Traveler's voice-over template tells them apart: a file per line for each, and
// A word choice in the text
export const TravelerGender = {
  Female: "female",
  Male: "male",
} as const;

export type TravelerGender = (typeof TravelerGender)[keyof typeof TravelerGender];

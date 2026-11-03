// The word a required field's hint ends with, after its description when it has one
const REQUIRED_HINT = "Required";

// The hint a field draws beneath it: its description, and the required word after that when the field is required
export const getSurveyFieldHint = (description: string, isRequired: boolean): string =>
  isRequired ? [description, REQUIRED_HINT].filter(Boolean).join(" ") : description;

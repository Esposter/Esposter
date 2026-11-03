// A text with a multiplication, power, division or remainder sign is no number.
// A minus or plus sign after its first character marks a negative or positive number instead
export const checkIsSurveyLogicStringOperator = (text: string): boolean => {
  if (text.lastIndexOf("-") > 0 || text.lastIndexOf("+") > 0) return false;

  return ["*", "^", "/", "%"].some((operator) => text.includes(operator));
};

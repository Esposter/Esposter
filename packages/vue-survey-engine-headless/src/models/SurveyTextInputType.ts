// The kinds of input a text question takes, each the input type the browser types its answer with
export const SurveyTextInputType = {
  Date: "date",
  DatetimeLocal: "datetime-local",
  Email: "email",
  Number: "number",
  Password: "password",
  Tel: "tel",
  Text: "text",
  Time: "time",
  Url: "url",
} as const;
export type SurveyTextInputType = (typeof SurveyTextInputType)[keyof typeof SurveyTextInputType];

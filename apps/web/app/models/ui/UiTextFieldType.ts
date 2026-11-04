// What a text field takes other than text: a number, stepped by the arrows and still read as the text typed, a search,
// Drawn as a pill with a search mark, its label as the hint inside it, a password, its text masked, and a clear button
// Once it holds text, or a time of day, read as HH:mm. An email, a telephone number or a URL is checked and typed by the
// Browser, which gives it the keyboard and the autofill for that kind. A day is a date field's, drawn in the library's calendar
export enum UiTextFieldType {
  Email = "email",
  Number = "number",
  Password = "password",
  Search = "search",
  Tel = "tel",
  Time = "time",
  Url = "url",
}

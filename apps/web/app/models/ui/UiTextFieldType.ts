// What a text field takes other than text: a day, picked from the browser's own calendar in the page's colour scheme
// And read as YYYY-MM-DD, a number, stepped by the arrows and still read as the text typed, a search, drawn as a pill
// With a search mark, its label as the hint inside it, and a clear button once it holds text, or a time of day, read as
// HH:mm
export enum UiTextFieldType {
  Date = "date",
  Number = "number",
  Search = "search",
  Time = "time",
}

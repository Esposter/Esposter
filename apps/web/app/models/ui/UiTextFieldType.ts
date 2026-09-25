// What a text field takes other than text: a number, stepped by the arrows and still read as the text typed, a search,
// Drawn as a pill with a search mark, its label as the hint inside it, and a clear button once it holds text, or a time
// Of day, read as HH:mm. A day is a date field's, drawn in the library's calendar
export enum UiTextFieldType {
  Number = "number",
  Search = "search",
  Time = "time",
}

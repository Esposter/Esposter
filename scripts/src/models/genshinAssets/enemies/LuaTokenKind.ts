// What a token of a Lua table literal is: punctuation, a name, a number or a quoted string
export enum LuaTokenKind {
  Name = "name",
  Number = "number",
  Punctuation = "punctuation",
  String = "string",
}

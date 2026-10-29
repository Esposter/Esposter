// An `npm:<packageName>@<range>` specifier, which installs `packageName` under the name it is declared as
export interface AliasSpecifier {
  packageName: string;
  range: string;
}

// A command whose exit status says a tool is installed or a login is in place.
// When `output` is given, the command's output must match it too.
// That tells a tool at the version the repository builds with from another one
export interface SetupProbe {
  args: readonly string[];
  file: string;
  output?: RegExp;
}

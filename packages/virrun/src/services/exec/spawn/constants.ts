/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands every exported constant's annotation */
// The characters cmd.exe reads as syntax outside quotes, each caret-escaped by the escapers (see
// http://www.robvanderwoude.com/escapechars.php). A quote is in the set so the quotes wrapping an argument are escaped too.
export const CMD_META_CHARACTERS_REGEX: RegExp = /(?<character>[()[\]%!^"`<>&|;, *?])/gu;
// A file that node runs directly rather than through cmd.exe.
export const WIN32_EXECUTABLE_REGEX: RegExp = /\.(?:com|exe)$/iu;
// A line break ends the command line inside cmd.exe even within quotes, and a percent sign expands an environment
// Variable whose name the caret escaping itself spells (`set path^^=…` makes `%path%` run `"&calc`), so an argument
// Carrying either is refused rather than escaped.
export const CMD_UNSAFE_ARGUMENT_REGEX: RegExp = /[\n\r%]/u;

// The refusal for a command's name, the arguments after it and the folder it runs in from the session's ("" for the
// Session's own), undefined when the command is not one the guard reads
export type CommandRefusal<T = string> = (name: string, args: string[], directory: string) => T | undefined;

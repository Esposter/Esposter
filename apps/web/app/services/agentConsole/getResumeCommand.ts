// What a terminal runs to take a session over from the page: from the session's own folder, since a terminal finds a
// Session only under the folder it ran in, and quoted, so a folder with a space in it stays one argument in PowerShell
// And in a POSIX shell alike
export const getResumeCommand = (cwd: string, sessionId: string): string => `cd "${cwd}"; claude --resume ${sessionId}`;

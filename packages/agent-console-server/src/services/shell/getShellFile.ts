// The shell a new terminal runs: PowerShell on Windows, as the Code tab's terminal opens, and the person's own
// Elsewhere
export const getShellFile = (): string =>
  process.platform === "win32" ? "powershell.exe" : (process.env.SHELL ?? "/bin/sh");

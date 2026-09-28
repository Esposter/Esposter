// The terminal drawing a shell: written each chunk of output as it comes, and cleared when the host replays the shell's
// Output from its start
export interface ShellListener {
  reset: () => void;
  write: (data: string) => void;
}

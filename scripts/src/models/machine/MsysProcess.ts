// An MSYS process as Git's own `ps -W` lists it: its id and parent in the MSYS process table, which judges it, not the
// Win32 parent a process table also keeps
export interface MsysProcess {
  parentProcessId: number;
  processId: number;
}

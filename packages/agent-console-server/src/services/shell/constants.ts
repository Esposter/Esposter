// The script node-pty forks to list a Windows shell's console processes before ending it. Forked from inside the single
// Executable, it runs the executable again with that script's path, which the executable answers itself
export const CONSOLE_LIST_AGENT_NAME = "conpty_console_list_agent";

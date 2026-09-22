// One command of a hook entry in user settings, as the tool spells it; optional fields (timeout, async) pass through
export interface HookCommand {
  [key: string]: unknown;
  command: string;
  type: "command";
}

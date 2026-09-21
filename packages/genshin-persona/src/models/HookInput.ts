// The fields this plugin reads off the JSON Claude Code pipes into a hook, spelled as the tool spells them
export interface HookInput {
  // The piece of the reply a MessageDisplay hook is handed: whole lines, since the tool flushes at a line break
  delta?: string;
  session_id?: string;
  turn_id?: string;
}

// The fields this plugin reads off the JSON Claude Code pipes into a hook, spelled as the tool spells them
export interface HookInput {
  last_assistant_message?: string;
  session_id?: string;
}

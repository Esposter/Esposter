// The fields this plugin reads off an entry of the service's voice list, spelled as the service spells them.
// Unknown rather than the string and string list the API promises, because nothing between the socket and here
// Checks them: a body is narrowed to a list of objects only, so a field's own type is the reader's to establish
export interface SpeechVoiceListEntry {
  ShortName?: unknown;
  StyleList?: unknown;
}

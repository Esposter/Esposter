// The `statusLine` user setting as the tool spells it; the optional fields (padding, refresh interval) pass through
export interface StatusLine {
  [key: string]: unknown;
  command: string;
  type: "command";
}

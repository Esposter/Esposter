// What the runtime reports while it fetches a file it has not cached yet; the other statuses it reports carry no
// Number and are not read
export interface VoiceProgress {
  file?: string;
  progress?: number;
  status: string;
}

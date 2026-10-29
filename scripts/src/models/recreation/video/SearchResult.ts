// One entry of yt-dlp's JSON search output, as it prints it: the fields it may leave out or write as null
export interface SearchResult {
  chapters?: { start_time: number; title: string }[] | null;
  duration?: number | null;
  fps?: number | null;
  height?: number | null;
  title: string;
  upload_date?: string | null;
  uploader?: string | null;
  webpage_url: string;
}

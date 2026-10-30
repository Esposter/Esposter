// One entry of yt-dlp's JSON search output, as it prints it: the fields it may leave out or write as null
export interface SearchResult {
  chapters?: null | { start_time: number; title: string }[];
  duration?: null | number;
  fps?: null | number;
  height?: null | number;
  title: string;
  upload_date?: null | string;
  uploader?: null | string;
  webpage_url: string;
}

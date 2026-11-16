// One entry of yt-dlp's JSON search output, as it prints it: the fields it may leave out or write as null
export interface SearchResult {
  chapters?: null | undefined | { start_time: number; title: string }[];
  duration?: null | number | undefined;
  fps?: null | number | undefined;
  height?: null | number | undefined;
  title: string;
  upload_date?: null | string | undefined;
  uploader?: null | string | undefined;
  webpage_url: string;
}

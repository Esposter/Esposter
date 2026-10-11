// The check that refuses an AnimeStudio run while the files it reads are in use, and the error it reports: the subject
// That is in use, and the reason it cannot be read
export interface AnimeStudioBlockGuard {
  checkIsBlocked: () => boolean;
  reason: string;
  subject: string;
}

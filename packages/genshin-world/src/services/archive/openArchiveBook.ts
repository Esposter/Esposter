import type { ArchiveBook } from "#src/models/archive/ArchiveBook";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { openArchiveEntry } from "#src/services/archive/openArchiveEntry";

// The progress with the volume a picked up item is opened in the Books section, as the game takes a volume straight into
// The Archive rather than the bag. An item that is no volume's material leaves the progress as it was
export const openArchiveBook = (
  progress: ArchiveProgress,
  books: readonly ArchiveBook[],
  itemId: number,
): ArchiveProgress => {
  const book = books.find(({ materialId }) => materialId === itemId);
  return book ? openArchiveEntry(progress, ArchiveSection.Books, book.id) : progress;
};

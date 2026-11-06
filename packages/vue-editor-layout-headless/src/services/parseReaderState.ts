import type { Layout } from "#src/models/Layout";
import type { ReaderState } from "#src/models/ReaderState";

import { readerStateSchema } from "#src/models/ReaderState";
import { fitReaderState } from "#src/services/fitReaderState";
import { getDefaultReaderState } from "#src/services/getDefaultReaderState";

// A stored value read back as a reader state for a layout. A value the schema does not accept is the default state
// An accepted one is fitted to the layout, which is where its stale ids and out-of-limit sizes are dropped
export const parseReaderState = (layout: Layout, value: unknown): ReaderState => {
  const parseResult = readerStateSchema.safeParse(value);
  return parseResult.success ? fitReaderState(layout, parseResult.data) : getDefaultReaderState();
};

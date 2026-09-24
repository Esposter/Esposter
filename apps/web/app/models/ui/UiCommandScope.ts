import type { UiCommand } from "@/models/ui/UiCommand";

// A surface's own search inside the palette: the docs, the rooms, the resources. The surface keeps its search stack
// And hands the palette its query and what that query finds
export interface UiCommandScope {
  commands: () => UiCommand[];
  hasMore?: () => boolean;
  isPending?: () => boolean;
  // Run as the palette closes on a result, such as a search remembered for next time
  onSelect?: () => void;
  // What the palette's field says while it searches this scope
  placeholder: string;
  query: Ref<string>;
  readMore?: (onComplete: () => void) => Promise<void>;
  // Named on the scope's chip in the palette's field
  title: string;
}

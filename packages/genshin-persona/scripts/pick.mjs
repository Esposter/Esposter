// Node strips types and takes no `enum`, so the entry registers tsx before it loads its TypeScript
import "tsx/esm";

await import("#scripts/pick");

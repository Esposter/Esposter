// Node strips types and takes no `enum`, so the entry registers tsx before it loads its TypeScript
import { register } from "tsx/esm/api";

register();
await import("#scripts/voice");

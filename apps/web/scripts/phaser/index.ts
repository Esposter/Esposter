import { createFilePack } from "@@/scripts/phaser/filePack/createFilePack";
import { remove } from "@@/scripts/phaser/services/remove";

await remove();
await createFilePack();

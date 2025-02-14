import { generateFilePack } from "@@/scripts/phaser/filePack/generateFilePack";
import { remove } from "@@/scripts/phaser/util/remove";

await remove();
await generateFilePack();

import { fillGameDataMirror } from "#scripts/gameData/mirror/fillGameDataMirror";
import gameDataLock from "#src/generated/gameDataLock.json" with { type: "json" };

// CI's fill of the mirror before the coverage shards restore it, run by Node itself, which reads the lock as JSON
console.log(`${await fillGameDataMirror(gameDataLock)} objects in the game data mirror`);

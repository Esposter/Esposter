import ground from "#src/data/windrise/ground.json";
import { createGaussianHillsHeight } from "genshin-engine";

// Windrise's ground: our Gaussian hills fitted to the game's terrain tiles round the oak's foot, which stands at the
// Origin (`genshin:assets fit windrise`)
export const getWindriseHeight = createGaussianHillsHeight(ground);

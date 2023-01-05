import { Game } from "@/models/clicker";
import { CLICKER_STORE } from "@/util/constants.client";
import { isServer } from "@/util/constants.common";
import { defineStore, skipHydrate } from "pinia";

export const useGameStore = defineStore("clicker/game", () => {
  const initialGame: Game = { noPoints: 0, boughtUpgrades: [], boughtBuildings: [] };
  const clickerStore = isServer() ? null : localStorage.getItem(CLICKER_STORE);
  const game = ref<Game>(!isServer() && clickerStore ? JSON.parse(clickerStore) : initialGame);
  const saveGame = () => localStorage.setItem(CLICKER_STORE, JSON.stringify(game.value));
  // Game state requires local storage which only exists in the client so we won't hydrate in the server
  return { game: skipHydrate(game), saveGame };
});

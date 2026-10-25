// Windrise's fitted plants: each prefab with its places in our region's axes, as `windrise/plants.json` holds them
export interface FittedPlants {
  plants: { name: string; places: { position: { x: number; z: number } }[] }[];
}

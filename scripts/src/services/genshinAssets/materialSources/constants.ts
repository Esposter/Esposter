// The game's environment animal gather table in the dump, which names each animal's item by its animal id
export const ENV_ANIMAL_GATHER_TABLE_NAME = "EnvAnimalGatherExcelConfigData";
// The official map's labels, under Animals, of the critters picked up whole as the item their gather row gives: the
// Crystalflies and each other critter group that has a gather row. Their points are material sources and not the fleeing
// Animals the wildlife dataset holds. Butterflies with no gather row stay out, and so does every label none joins
export const MATERIAL_SOURCE_LABEL_IDS: readonly number[] = [
  // Crystalflies
  277, 281, 298, 315, 393, 513, 624,
  // Crabs
  275, 282, 288, 291, 307,
  // Unagi
  278, 308, 339,
  // Lizards
  285, 296, 301, 305, 443,
  // Loaches
  292, 300, 304,
  // Frogs
  297, 302, 303, 571,
  // Insects
  350, 623, 625, 749, 862, 863,
  // Butterflies
  348,
];

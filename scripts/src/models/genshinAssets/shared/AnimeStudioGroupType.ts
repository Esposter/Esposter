// How AnimeStudio folders what it exports.
// A folder per container: the prefab an object is in, or its type when none holds it.
// A folder per source file its objects came from, or a folder per class.
export enum AnimeStudioGroupType {
  ByContainer = "ByContainer",
  BySource = "BySource",
  ByType = "ByType",
}

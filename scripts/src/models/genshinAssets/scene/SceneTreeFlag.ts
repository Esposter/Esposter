// What a node of a scene's tree says about its arrangement, each the first question that arrangement turns on
export enum SceneTreeFlag {
  // No children and nothing drawn: where a script spawns a prefab at run time
  EmptyAnchor = "empty anchor",
  // Fewer children dumped than it names: they sit in a block not read
  LostChildren = "children not dumped",
  // A father no dump holds: the place and scale it composes through are lost with it
  LostFather = "father not dumped",
  // A root at the origin, unturned: a prefab's root, placed where something spawns it
  RootAtOrigin = "root at the origin",
  // A mesh laid out under several roots: only some of those arrangements are the scene's
  SharedMesh = "mesh under several roots",
}

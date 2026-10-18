# Reading a PMX

three ships no MMD loader and the workspace has no PMX parser, so the engine reads the model itself, from the public PMX 2.0 and 2.1 specification. `parsePmx` reads the file's sections in order through `PmxReader`, a cursor sized by the header's globals: the text's encoding, the extra vectors each vertex carries, and the width of each kind of index.

- **Everything is turned into three's space as it is read.** MMD is left-handed, so z is mirrored in every position, normal, bone, morph offset, rigid body and joint. Mirroring turns each triangle's winding round, so the reader reverses it, and turns a joint's ranges round as well: a translation's along z, and a rotation's about x and y. An MMD model faces +z once mirrored.
- **Every vertex is bound to four bones.** One bone takes all of a vertex's weight, two share it by the first one's weight, and four by their own. three's skinning blends linearly, so a spherical blend is read as its two bones' linear one, and a dual quaternion blend as its four bones' linear one. A slot the file leaves unused names no bone and is bound to the first at no weight. The four weights need not sum to one in the file, so the mesh scales them until they do.
- **What is kept.** The model's name; its vertices; its triangles; its texture paths; each material's diffuse colour, triangle count, faces drawn, edge, texture, sphere map and toon ramp; each bone's name, place and parent; vertex and group morphs; and the rigid bodies and joints MMD's physics reads. A morph of any other kind keeps its place in the list with nothing in it, so a group morph's members still index the whole list.
- **What is passed over.** The comments and every name in English, the specular and ambient colours, the edge's own colour and size, every bone field past its parent, the display frames, and a 2.1 file's soft bodies.

No parsed model is cached, a kept pack's included. The browser keeps a pack's files, and the model is parsed again each time it is drawn. `parsePmx.bench.md` reads a model of tens of megabytes in tens of milliseconds, and a structured clone of what it returns, the least an IndexedDB read of it would cost, takes about a third of that before any disk is read. A cache would save a few milliseconds a character and add a store to keep.

## Nothing swings yet

The rigid bodies and joints are read for the physics that will swing hair and cloth, and nothing reads them yet. The morphs are read for expressions, and none is set.

## Key files

| File                                                        | Role                                                                    |
| :---------------------------------------------------------- | :---------------------------------------------------------------------- |
| `packages/genshin-engine/src/character/parsePmx.ts`         | Reads a PMX file's sections in order into three's space                 |
| `packages/genshin-engine/src/models/character/PmxReader.ts` | The cursor over the file, sized by its globals, mirroring z as it reads |
| `packages/genshin-engine/src/character/parsePmxVertices.ts` | Each vertex's place, normal, texture coordinate and four bones          |
| `packages/genshin-engine/src/character/parsePmxMorphs.ts`   | Vertex and group morphs read, every other kind passed over by its size  |
| `packages/genshin-engine/src/character/parsePmx.bench.ts`   | A model's read timed at two sizes, against a structured clone of it     |
| `packages/genshin-engine/src/character/constants.ts`        | MMD's unit in metres                                                    |

## Sources

- [PMX 2.0/2.1 specification](https://gist.github.com/felixjones/f8a06bd48f9da9a4539f), Felix Jones: the byte layout of every section the reader reads and passes over.
- [mmd-parser](https://github.com/takahirox/mmd-parser), takahirox: the turn from MMD's left-handed space into a right-handed one, z mirrored with the triangles' winding, the rotations' x and y, and the joints' ranges turned round.

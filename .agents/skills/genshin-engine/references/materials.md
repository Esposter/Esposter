# Materials, instancing and detail

Read when a mesh is instanced, a material is made for a kind of thing, or a change of detail cross-fades.

- **An instanced mesh is `createInstancedMesh`, never three's `InstancedMesh` constructed by hand.** Its matrices sit in a storage buffer uploaded only when they change, where three keeps a mesh's matrices that fit a uniform buffer in one it writes again on every draw, the previous frame's beside them. Only `createSightProxy` constructs one itself, to share its source's buffer (`openspec/specs/genshin/rendering-style/design.md`).

- **A material is made once per kind, not per landmark.** Each program a material adds costs a node build on the main thread the first time it draws, so a landmark that makes its own bark, leaf or part materials grows the program count with every instance in reach (`openspec/specs/genshin/rendering-style/design.md`).

- **A change of detail cross-fades by dither, never pops.** The finer detail draws `createDitherFadeNode(fade).not()` as its `maskNode` and the coarser `createDitherFadeNode(fade)`, so no pixel doubles or drops across the band (`openspec/specs/genshin/trees/design.md`).

# Whiteboard on a third-party engine

The idea was to mount a third-party whiteboard engine as the whiteboard's editor, with a Vue component embedding it and the engine's element model converted to ours. Other third-party drawing and graph engines, whiteboard SDKs and node-graph libraries fell under the same reasoning.

## Why not

The product takes no new third-party dependency, which the owner decided, and the whiteboard is built on the headless editor core and drawn by our own code. The engine would also have cost a second UI runtime beside the app's, a second element model to convert to, and the engine's own interaction and styling in place of ours. Excalidraw remains the reference for how a whiteboard feels, and the whiteboard copies none of its code or packages.

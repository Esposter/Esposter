# Text to diagram

Writing a diagram as text, such as Mermaid, and turning it into shapes and arrows on the board.

## Why not

A text-to-diagram converter needs a Mermaid dependency or a parser of its own, and the owner decided that the product takes no new third-party dependency. The whiteboard is built on the headless editor core and drawn by our own code, as the [rejected third-party engine](../whiteboard-third-party-engine/design.md) record says. Shapes come from the toolbar, which places each one by its tool and a drag, so the board does not need a second way in.

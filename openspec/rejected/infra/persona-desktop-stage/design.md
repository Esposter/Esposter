# Persona desktop stage

The character on the desktop beside the terminal: each spoken line as a bubble and a sound on a Live2D model in a viewer already running, the model's reactions to the session, a local chat page whose typed lines land in the terminal's own session with the plain half of the answer returned to it, a tool approval answered by a tap on the model, a header nameplate for that page, and a Live2D window of the plugin's own.

## Why not

The work is done in the terminal alone, and a second place to type or to read a reply is a surface nobody uses. The face and the voice were the part the persona was for, and the voice is the persona's own spoken replies, heard in the terminal's session without a window. Both built halves were removed when this was rejected: the viewer sink with its verb and reactions, and the channel server with its page, its reply tool and its approval relay.

The rest follows from that. A header nameplate for a page nobody opens, and a renderer of the plugin's own for a model nobody shows, have nothing left to serve.

## What went with it

The viewer verb and its stored setup, the notification and stop reactions, the channel server and its manifest entry, and the plugin's dependency on the MCP SDK. The platform's channel capability stays a surveyed fact of the [Claude interface](../../../specs/infra/claude-interface/README.md), unused.

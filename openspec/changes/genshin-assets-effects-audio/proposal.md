# Effects, audio and music assets

## Why

The game gives feedback on nearly every action: a hit throws a spark and a number, a skill or burst lights its caster, a world effect is driven by an emitter, and every screen has its own music and sounds. The recreation draws almost none of it. A hit shows no contact, a cast shows nothing at its caster, the world's emitters have no settings, and only the login's music and door sound play. The game's own effects and sounds cannot ship, so each missing piece has to close with a stand-in of ours, sized, timed and sounded from the game's own captures and recordings. Several of these pieces already belong to other changes, and this change links to them rather than repeating their work.

## What Changes

- The combat draws a stand-in spark at each landed hit, the damage as a number, a visual at each skill or burst cast and a flash at a reaction.
- Energy drops fly from a defeated enemy to the party, and a burst's landing shakes the camera.
- The world's effect emitters play rates and lives fitted from the game's exports, and one effect shader is ported from its listing.
- The screens other than the login play their own music and their matched sounds, and the Oculus chime plays the game's own sound in place of its tone.
- Four measures are built first: a per-frame rectangle statistic over a clip, a record key for each component's sounds and music, a reader of particle system fields, and a listing of effect shaders.

## Capabilities

- **genshin/effects** (new): the visual feedback of the combat and the world.
- **genshin/game-audio** (new): the game's own sounds and music on the screens beyond the login.

## Impact

The combat and minimap components and the world's services in `packages/genshin-world`, the effect nodes in `packages/genshin-engine`, and the parity and asset commands, sound and music maps and fits in `scripts`. A component's sound and music records reach the hosted game data through the fit's publish, and the lock changes only by that publish. Gaps already owned by other changes are linked and change nothing here. No game art, mesh, texture or audio is committed or shipped.

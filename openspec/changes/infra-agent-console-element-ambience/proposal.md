# Element ambience

## Why

The spoken replies are heard and not seen. On the agent console the character's voice has no picture, so a reader hears a line with nothing on the screen that answers it. A backdrop in the character's element, moved by the loudness of the line being spoken, gives the voice a picture without asking the reader to look at anything new.

## What Changes

Behind the console's other views, a slow field in the character's element swells with the loudness of each spoken line and settles when the line ends.

- Each spoken line's loudness is measured from the clip the voice already has, and sent to the console with the line before the clip plays.
- Each of the character's elements has its own field: ripples for Hydro, drifting spores for Dendro, embers for Pyro, frost for Cryo, and a field of its own for each other element.
- The field's intensity follows the line in time with playback.
- With no line playing the field idles at its lowest rate, and it draws nothing while the page is hidden.
- The field follows the line even when the device's volume is muted.

## Capabilities

- **infra/agent-console/element-ambience** (new)

## Waiting on

- `openspec/changes/infra-agent-console-themes/`, whose Genshin theme is the one producer of spoken lines the field follows.

## Impact

- The voice gains a loudness envelope sent with each line.
- The console gains a backdrop view drawn behind every other view in the Genshin theme.
- The fluid simulator already used for Hydro's calm state is reused as it stands.

Size kept as the source page's own: splitting it is a later decision.

# Fixture Corpora

Read when a suite reads a folder of fixture files — maps, payloads, documents — or a corpus is being trimmed.

A corpus of files — maps, payloads, documents — is the same rule applied to a folder: **one file per shape the code
under test can tell apart**, and each file the least content that carries its shape. The shape is what the parser
branches on and what the assertion reads (an element, an attribute, a value it switches on, the _absence_ of one);
everything else is another copy of a case already there. Name each file after the shape it carries
(`emptyObjectLayer.tmx`), not after where it came from, so a reader knows what deleting it would lose, and
canonicalize the values inside it like any other literal — a name the code never reads is `""`, a number it never
reads is `0`, and only what the code branches on keeps a real value.

Prove it rather than eyeballing it: take the union of (parent element, element, attribute, branched-on value) over
the old corpus and over the new one, and keep the trim only when nothing is lost and nothing is invented. The parent
is in the record because a relationship is a branch too — a node the code reaches only by recursing into its
container is a different shape from the same node at the top level — and a flat vocabulary reads the two as one.

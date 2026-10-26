# Caching parsed PMX models

A character's model is parsed from its pack's PMX file each time it is drawn, and a parsed model could instead be kept in a store, such as IndexedDB, so a later draw reads it back without the parse.

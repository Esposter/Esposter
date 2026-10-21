# Publish scopes

Read when a publish replaces one key, or an authored world file is edited and published.

The one-line rules are in `SKILL.md`; this page is their reasoning.

## What a publish replaces

`genshin:assets fit <component> --only <part>` and the parity loops (`publishGameDataRecord`) each replace one key and keep the rest of its dataset; `genshin:data authored` publishes each authored file as a key scope too, so it keeps the grounds the fits publish and the fits' `login`, and a retired ground's key is a deleted lock line. A bare dataset is never passed as a key (`toGameDataKeyScopes`).

## An authored world file

A region's ground file is deleted once `fit <region> --only ground` publishes its fitted pieces under `ground/<region>/`, which `authored` refuses to overwrite. The bundle never imports it.

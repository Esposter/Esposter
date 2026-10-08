# Parity music scores

Each segment of the music's last `pnpm -C scripts genshin:parity listen`, our render against the game's own
sound. Pitch agreement runs from 0 to 1 (identical); each band's distance is the mean gap between the two's
levels in decibels, 0 identical, and the distance their mean; each band's bias is that gap signed, ours over
the game's, under 0 where ours is the quieter. Commit it with the change that moved it, as a bench's report is
committed.

| Screen | Segment | Pitch agreement | Distance | 63 Hz | 125 Hz | 250 Hz | 500 Hz | 1 kHz | 2 kHz | 4 kHz | 8 kHz |
| :----- | :------ | --------------: | -------: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `LoginMusic` | `435559168` | 0.893 | 5.1 dB | 6.0 | 4.7 | 4.6 | 4.0 | 4.6 | 5.3 | 5.8 | 6.0 |
| `LoginMusic` | `1041996604` | 0.877 | 5.4 dB | 6.2 | 4.2 | 4.5 | 3.6 | 5.5 | 6.1 | 6.4 | 6.6 |

| Screen | Segment | 63 Hz bias | 125 Hz bias | 250 Hz bias | 500 Hz bias | 1 kHz bias | 2 kHz bias | 4 kHz bias | 8 kHz bias |
| :----- | :------ | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `LoginMusic` | `435559168` | 3.5 | 1.9 | -2.4 | -0.3 | -0.8 | -0.8 | 1.5 | -0.1 |
| `LoginMusic` | `1041996604` | 1.7 | 1.7 | -2.4 | -1.9 | -1.1 | -0.4 | 2.5 | -2.5 |

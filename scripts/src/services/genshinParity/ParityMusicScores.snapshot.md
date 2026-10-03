# Parity music scores

Each segment of the music's last `pnpm -C scripts genshin:parity listen`, our render against the game's own
sound. Pitch agreement runs from 0 to 1 (identical); each band's distance is the mean gap between the two's
levels in decibels, 0 identical, and the distance their mean; each band's bias is that gap signed, ours over
the game's, under 0 where ours is the quieter. Commit it with the change that moved it, as a bench's report is
committed.

| Screen | Segment | Pitch agreement | Distance | 63 Hz | 125 Hz | 250 Hz | 500 Hz | 1 kHz | 2 kHz | 4 kHz | 8 kHz |
| :----- | :------ | --------------: | -------: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `LoginMusic` | `435559168` | 0.867 | 8.7 dB | 7.9 | 7.4 | 5.7 | 7.2 | 9.1 | 13.0 | 10.6 | 8.3 |
| `LoginMusic` | `1041996604` | 0.798 | 9.1 dB | 16.6 | 6.0 | 5.2 | 8.6 | 8.4 | 9.8 | 10.3 | 8.2 |

| Screen | Segment | 63 Hz bias | 125 Hz bias | 250 Hz bias | 500 Hz bias | 1 kHz bias | 2 kHz bias | 4 kHz bias | 8 kHz bias |
| :----- | :------ | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `LoginMusic` | `435559168` | -3.6 | 0.1 | -3.3 | -5.0 | -6.2 | -9.7 | -4.6 | 2.6 |
| `LoginMusic` | `1041996604` | -15.3 | 2.0 | -3.7 | -7.3 | -4.2 | -5.5 | -0.1 | -2.0 |

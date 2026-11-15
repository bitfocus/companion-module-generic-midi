## Generic MIDI module for Companion

Please visit https://discourse.checkcheckonetwo.com for help, discussions, suggestions, etc.

_Andrew Broughton 2026_

---

### This module supports the following MIDI message types:

- Note On
- Note Off
- Control Change (CC)
- Program Change (PC)
- Aftertouch
- Pitch Wheel
- Channel Pressure
- Sysex
- MIDI Show Control (MSC) send and receive feedback
- MIDI Time Code (receive only)

MSC messages use a destination device ID, command format, command code, and optional data. Enter data as ASCII; use `|` to separate cue, cue list, and cue path fields. Prefix every hexadecimal byte with `0x` (for example `0x31 0x2E 0x32`). The boolean MSC feedback matches the most recently received MSC message and can filter by device, format, command, and exact data. The MSC Data Value feedback returns the received data, with optional device, format, and command filters. MSC itself does not define acknowledgements.

### Features:

- MacOS, Windows, Linux Support
- MIDI over LAN via rtpMIDI (Network-MIDI on MacOS)
- Using incoming Midi Timestamp with Action Recorder
- noteStates is kept as an array of booleans laid out as `[channel][note #]` e.g. when a noteon message arrives on channel 1, for note 60 then `$(generic-midi:noteStates)[1][60] == true`. If noteoff (or noteon with velocity = 0) arrives on channel 3, note 50, then `$(generic-midi:noteStates)[3][50] == false`.

### To Do:

- Long Sysex message support
- Filtering of Real-Time messages
- Virtual Ports under Windows?

Thanks to _Julian Waller_ for rewriting node-midi to TS and creating a companion TS template!

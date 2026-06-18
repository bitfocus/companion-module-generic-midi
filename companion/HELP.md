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
- MIDI Time Code (receive only)

### Features:

- MacOS, Windows, Linux Support
- MIDI over LAN via rtpMIDI (Network-MIDI on MacOS)
- Using incoming Midi Timestamp with Action Recorder
- noteStates is kept as an array of booleans laid out as `[channel][note #]` e.g. when a noteon message arrives on channel 1, for note 60 then `$(generic-midi:noteStates)[1][60] == true`. If noteoff (or noteon with velocity = 0) arrives on channel 3, note 50, then `$(generic-midi:noteStates)[3][50] == false`.

### To Do:

- Long Sysex message support
- Filtering of Real-Time messages
- MSC support?
- Virtual Ports under Windows?

Thanks to _Julian Waller_ for rewriting node-midi to TS and creating a companion TS template!

# companion-module-generic-midi

A MIDI Module to allow standard MIDI messages to be sent to and received from Companion v3
v1.1.8

Please visit http://discourse.checkcheckonetwo.com for help, discussions, suggestions, etc.

_Andrew Broughton, 2024_

Supported MIDI Commands:

- Note On
- Note Off
- Control Change
- Program Change
- Aftertouch
- Channel Pressure
- Pitch Wheel
- Sysex
- MIDI Time code (receive only)

---

**REVISION HISTORY**

1.1.8 Error handling for badly behaved devices

1.1.7 Ignore unsupported commands, bug fix for MTC

1.1.5 Add "Last Message Received" Variable

1.1.4 Ignore Real-Time Messages

1.1.3 Keep only last MIDI message per type in Recorder

1.1.2 Remove Virtual Ports

1.1.1 Initial Release

---

See [HELP.md](./companion/HELP.md)

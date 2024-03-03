## companion-module-generic-midi

## A generic MIDI module for Companion (v1.1.1)

Supports the following Incoming and Outgoing MIDI message types:

- Note On
- Note Off
- Control Change (CC)
- Program Change (PC)
- Aftertouch
- Pitch Wheel
- Channel Pressure
- Sysex
- MIDI Time Code (receive only)

## Features:

- MacOS, Windows, Linux Support
- MIDI over LAN via rtpMIDI (Network-MIDI on MacOS)
- Virtual Ports (to allow communication to and from apps)

## To Do:

- Add timing to Action Recordings
- Long Sysex message support
- Filtering of Real-Time messages
- MSC support?

Thanks to Julian Waller for rewriting node-midi to TS and creating a companion TS template!

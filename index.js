// Generic MIDI Module

var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	
	return self;
}

instance.prototype.MIDI_outputs = [];
instance.prototype.MIDI_outputs_list = [];

instance.prototype.MIDI_notes = [
	{id: 0, label: '0 - unassigned'},
	{id: 1, label: '1 - unassigned'},
	{id: 2, label: '2 - unassigned'},
	{id: 3, label: '3 - unassigned'},
	{id: 4, label: '4 - unassigned'},
	{id: 5, label: '5 - unassigned'},
	{id: 6, label: '6 - unassigned'},
	{id: 7, label: '7 - unassigned'},
	{id: 8, label: '8 - unassigned'},
	{id: 9, label: '9 - unassigned'},
	{id: 10, label: '10 - unassigned'},
	{id: 11, label: '11 - unassigned'},
	{id: 12, label: '12 - unassigned'},
	{id: 13, label: '13 - unassigned'},
	{id: 14, label: '14 - unassigned'},
	{id: 15, label: '15 - unassigned'},
	{id: 16, label: '16 - unassigned'},
	{id: 17, label: '17 - unassigned'},
	{id: 18, label: '18 - unassigned'},
	{id: 19, label: '19 - unassigned'},
	{id: 20, label: '20 - unassigned'},
	{id: 21, label: '21 - A0'},
	{id: 22, label: '22 - A#0'},
	{id: 23, label: '23 - B0'},
	{id: 24, label: '24 - C1'},
	{id: 25, label: '25 - C#1'},
	{id: 26, label: '26 - D1'},
	{id: 27, label: '27 - D#1'},
	{id: 28, label: '28 - E1'},
	{id: 29, label: '29 - F1'},
	{id: 30, label: '30 - F#1'},
	{id: 31, label: '31 - G1'},
	{id: 32, label: '32 - G#1'},
	{id: 33, label: '33 - A1'},
	{id: 34, label: '34 - A#1'},
	{id: 35, label: '35 - B1'},
	{id: 36, label: '36 - C2'},
	{id: 37, label: '37 - C#2'},
	{id: 38, label: '38 - D2'},
	{id: 39, label: '39 - D#2'},
	{id: 40, label: '40 - E2'},
	{id: 41, label: '41 - F2'},
	{id: 42, label: '42 - F#2'},
	{id: 43, label: '43 - G2'},
	{id: 44, label: '44 - G#2'},
	{id: 45, label: '45 - A2'},
	{id: 46, label: '46 - A#2'},
	{id: 47, label: '47 - B2'},
	{id: 48, label: '48 - C3'},
	{id: 49, label: '49 - C#3'},
	{id: 50, label: '50 - D3'},
	{id: 51, label: '51 - D#3'},
	{id: 52, label: '52 - E3'},
	{id: 53, label: '53 - F3'},
	{id: 54, label: '54 - F#3'},
	{id: 55, label: '55 - G3'},
	{id: 56, label: '56 - G#3'},
	{id: 57, label: '57 - A3'},
	{id: 58, label: '58 - A#3'},
	{id: 59, label: '59 - B3'},
	{id: 60, label: '60 - C4'},
	{id: 61, label: '61 - C#4'},
	{id: 62, label: '62 - D4'},
	{id: 63, label: '63 - D#4'},
	{id: 64, label: '64 - E4'},
	{id: 65, label: '65 - F4'},
	{id: 66, label: '66 - F#4'},
	{id: 67, label: '67 - G4'},
	{id: 68, label: '68 - G#4'},
	{id: 69, label: '69 - A4'},
	{id: 70, label: '70 - A#4'},
	{id: 71, label: '71 - B4'},
	{id: 72, label: '72 - C5'},
	{id: 73, label: '73 - C#5'},
	{id: 74, label: '74 - D5'},
	{id: 75, label: '75 - D#5'},
	{id: 76, label: '76 - E5'},
	{id: 77, label: '77 - F5'},
	{id: 78, label: '78 - F#5'},
	{id: 79, label: '79 - G5'},
	{id: 80, label: '80 - G#5'},
	{id: 81, label: '81 - A5'},
	{id: 82, label: '82 - A#5'},
	{id: 83, label: '83 - B5'},
	{id: 84, label: '84 - C6'},
	{id: 85, label: '85 - C#6'},
	{id: 86, label: '86 - D6'},
	{id: 87, label: '87 - D#6'},
	{id: 88, label: '88 - E6'},
	{id: 89, label: '89 - F6'},
	{id: 90, label: '90 - F#6'},
	{id: 91, label: '91 - G6'},
	{id: 92, label: '92 - G#6'},
	{id: 93, label: '93 - A6'},
	{id: 94, label: '94 - A#6'},
	{id: 95, label: '95 - B6'},
	{id: 96, label: '96 - C7'},
	{id: 97, label: '97 - C#7'},
	{id: 98, label: '98 - D7'},
	{id: 99, label: '99 - D#7'},
	{id: 100, label: '100 - E7'},
	{id: 101, label: '101 - F7'},
	{id: 102, label: '102 - F#7'},
	{id: 103, label: '103 - G7'},
	{id: 104, label: '104 - G#7'},
	{id: 105, label: '105 - A7'},
	{id: 106, label: '106 - A#7'},
	{id: 107, label: '107 - B7'},
	{id: 108, label: '108 - C8'},
	{id: 109, label: '109 - C#8'},
	{id: 110, label: '110 - D8'},
	{id: 111, label: '111 - D#8'},
	{id: 112, label: '112 - E8'},
	{id: 113, label: '113 - F8'},
	{id: 114, label: '114 - F#8'},
	{id: 115, label: '115 - G8'},
	{id: 116, label: '116 - G#8'},
	{id: 117, label: '117 - A8'},
	{id: 118, label: '118 - A#8'},
	{id: 119, label: '119 - B8'},
	{id: 120, label: '120 - C9'},
	{id: 121, label: '121 - C#9'},
	{id: 122, label: '122 - D9'},
	{id: 123, label: '123 - D#9'},
	{id: 124, label: '124 - E9'},
	{id: 125, label: '125 - F9'},
	{id: 126, label: '126 - F#9'},
	{id: 127, label: '127 - G9'}
];

instance.prototype.MIDI_controllers = [
	{id: 0, label: '0 - Bank Select (MSB)'},
	{id: 1, label: '1 - Modulation Wheel (MSB)'},
	{id: 2, label: '2 - Breath Controler (MSB)'},
	{id: 3, label: '3 - Undefined (MSB)'},
	{id: 4, label: '4 - Foot Pedal (MSB)'},
	{id: 5, label: '5 - Portamento Time (MSB)'},
	{id: 6, label: '6 - Data Entry (MSB)'},
	{id: 7, label: '7 - Volume (MSB)'},
	{id: 8, label: '8 - Balance (MSB)'},
	{id: 9, label: '9 - Undefined (MSB)'},
	{id: 10, label: '10 - Pan (MSB)'},
	{id: 11, label: '11 - Expression (MSB)'},
	{id: 12, label: '12 - Effect Controller 1 (MSB)'},
	{id: 13, label: '13 - Effect Controller 2 (MSB)'},
	{id: 14, label: '14 - Undefined (MSB)'},
	{id: 15, label: '15 - Undefined (MSB)'},
	{id: 16, label: '16 - General Purpose (MSB)'},
	{id: 17, label: '17 - General Purpose (MSB)'},
	{id: 18, label: '18 - General Purpose (MSB)'},
	{id: 19, label: '19 - General Purpose (MSB)'},
	{id: 20, label: '20 - Undefined (MSB)'},
	{id: 21, label: '21 - Undefined (MSB)'},
	{id: 22, label: '22 - Undefined (MSB)'},
	{id: 23, label: '23 - Undefined (MSB)'},
	{id: 24, label: '24 - Undefined (MSB)'},
	{id: 25, label: '25 - Undefined (MSB)'},
	{id: 26, label: '26 - Undefined (MSB)'},
	{id: 27, label: '27 - Undefined (MSB)'},
	{id: 28, label: '28 - Undefined (MSB)'},
	{id: 29, label: '29 - Undefined (MSB)'},
	{id: 30, label: '30 - Undefined (MSB)'},
	{id: 31, label: '31 - Undefined (MSB)'},
	{id: 32, label: '32 - Bank Select (LSB)'},
	{id: 33, label: '33 - Modulation Wheel (LSB)'},
	{id: 34, label: '34 - Breath Controler (LSB)'},
	{id: 35, label: '35 - Undefined (LSB)'},
	{id: 36, label: '36 - Foot Pedal (LSB)'},
	{id: 37, label: '37 - Portamento Time (LSB)'},
	{id: 38, label: '38 - Data Entry (LSB)'},
	{id: 39, label: '39 - Volume (LSB)'},
	{id: 40, label: '40 - Balance (LSB)'},
	{id: 41, label: '41 - Undefined (LSB)'},
	{id: 42, label: '42 - Pan (LSB)'},
	{id: 43, label: '43 - Expression (LSB)'},
	{id: 44, label: '44 - Effect Controller 1 (LSB)'},
	{id: 45, label: '45 - Effect Controller 2 (LSB)'},
	{id: 46, label: '46 - Undefined (LSB)'},
	{id: 47, label: '47 - Undefined (LSB)'},
	{id: 48, label: '48 - General Purpose (LSB)'},
	{id: 49, label: '49 - General Purpose (LSB)'},
	{id: 50, label: '50 - General Purpose (LSB)'},
	{id: 51, label: '51 - General Purpose (LSB)'},
	{id: 52, label: '52 - Undefined (LSB)'},
	{id: 53, label: '53 - Undefined (LSB)'},
	{id: 54, label: '54 - Undefined (LSB)'},
	{id: 55, label: '55 - Undefined (LSB)'},
	{id: 56, label: '56 - Undefined (LSB)'},
	{id: 57, label: '57 - Undefined (LSB)'},
	{id: 58, label: '58 - Undefined (LSB)'},
	{id: 59, label: '59 - Undefined (LSB)'},
	{id: 60, label: '60 - Undefined (LSB)'},
	{id: 61, label: '61 - Undefined (LSB)'},
	{id: 62, label: '62 - Undefined (LSB)'},
	{id: 63, label: '63 - Undefined (LSB)'},
	{id: 64, label: '64 - Damper Pedal on/off'},
	{id: 65, label: '65 - Portamento on/off'},
	{id: 66, label: '66 - Sostenuto Pedal on/off'},
	{id: 67, label: '67 - Soft Pedal on/off'},
	{id: 68, label: '68 - Legato Pedal on/off'},
	{id: 69, label: '69 - Hold Pedal 2 on/off'},
	{id: 70, label: '70 - Sound Variation'},
	{id: 71, label: '71 - Sound Timbre'},
	{id: 72, label: '72 - Sound Release Time'},
	{id: 73, label: '73 - Sound Attack Time'},
	{id: 74, label: '74 - Sound Brightness'},
	{id: 75, label: '75 - Sound Control 6'},
	{id: 76, label: '76 - Sound Control 7'},
	{id: 77, label: '77 - Sound Control 8'},
	{id: 78, label: '78 - Sound Control 9'},
	{id: 79, label: '79 - Sound Control 10'},
	{id: 80, label: '80 - General Purpose Button'},
	{id: 81, label: '81 - General Purpose Button'},
	{id: 82, label: '82 - General Purpose Button'},
	{id: 83, label: '83 - General Purpose Button'},
	{id: 84, label: '84 - Undefined on/off'},
	{id: 85, label: '85 - Undefined on/off'},
	{id: 86, label: '86 - ndefined on/off'},
	{id: 87, label: '87 - Undefined on/off'},
	{id: 88, label: '88 - Undefined on/off'},
	{id: 89, label: '89 - Undefined on/off'},
	{id: 90, label: '90 - Undefined on/off'},
	{id: 91, label: '91 - Effects/Reverb Level'},
	{id: 92, label: '92 - Tremulo Level'},
	{id: 93, label: '93 - Chorus Level'},
	{id: 94, label: '94 - Celeste (Detune) Level'},
	{id: 95, label: '95 - Phaser Level'},
	{id: 96, label: '96 - Data Entry +1'},
	{id: 97, label: '97 - Data Entry -1'},
	{id: 98, label: '98 - NRPN (MSB)'},
	{id: 99, label: '99 - NRPN (LSB)'},
	{id: 100, label: '100 - RPN (MSB)'},
	{id: 101, label: '101 - RPN (LSB)'},
	{id: 102, label: '102 - Undefined'},
	{id: 103, label: '103 - Undefined'},
	{id: 104, label: '104 - Undefined'},
	{id: 105, label: '105 - Undefined'},
	{id: 106, label: '106 - Undefined'},
	{id: 107, label: '107 - Undefined'},
	{id: 108, label: '108 - Undefined'},
	{id: 109, label: '109 - Undefined'},
	{id: 110, label: '110 - Undefined'},
	{id: 111, label: '111 - Undefined'},
	{id: 112, label: '112 - Undefined'},
	{id: 113, label: '113 - Undefined'},
	{id: 114, label: '114 - Undefined'},
	{id: 115, label: '115 - Undefined'},
	{id: 116, label: '116 - Undefined'},
	{id: 117, label: '117 - Undefined'},
	{id: 118, label: '118 - Undefined'},
	{id: 119, label: '119 - Undefined'},
	{id: 120, label: '120 - All Sound Off'},
	{id: 121, label: '121 - Reset All Controllers'},
	{id: 122, label: '122 - Local Switch on/off'},
	{id: 123, label: '123 - All Notes Off'},
	{id: 124, label: '124 - Omni Mode Off'},
	{id: 125, label: '125 - Omni Mode On'},
	{id: 126, label: '126 - Monophonic Mode On'},
	{id: 127, label: '127 - Polyphonic Mode On'}
];

instance.prototype.MSC_deviceid = [];

instance.prototype.MSC_commandformat = [
	{id: 'lighting.general', label: 'Lighting - General'},
	{id: 'sound.general', label: 'Sound - General'},
	{id: 'machinery.general', label: 'Machinery - General'},
	{id: 'video.general', label: 'Video - General'},
	{id: 'projection.general', label: 'Projection - General'},
	{id: 'processcontrol.general', label: 'Process Control - General'},
	{id: 'pyro.general', label: 'Pyro - General'},
	{id: 'all', label: 'All'}
];

instance.prototype.MSC_command = [
	{id: 'go', label: 'Go'},
	{id: 'stop', label: 'Stop'},
	{id: 'gojam', label: 'Go Jam'},
	{id: 'resume', label: 'Resume'},
	{id: 'timedgo', label: 'Timed Go'},
	{id: 'load', label: 'Load'},
	{id: 'set', label: 'Set'},
	{id: 'fire', label: 'Fire'},
	{id: 'alloff', label: 'All Off'},
	{id: 'restore', label: 'Restore'},
	{id: 'reset', label: 'Reset'},
	{id: 'gooff', label: 'Go Off'},
	{id: 'opencuelist', label: 'Open Cue List'},
	{id: 'closecuelist', label: 'Close Cue List'},
	{id: 'startclock', label: 'Start Clock'},
	{id: 'stopclock', label: 'Stop Clock'}
];

instance.prototype.init = function () {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.initModule();
};

instance.prototype.updateConfig = function (config) {
	var self = this;
	self.config = config;

	self.initModule();
};

instance.prototype.initModule = function () {
	var self = this;
	
	self.MIDI_outputs = [];
	self.MIDI_outputs_list = [
		{id: '0', label: '(Select a MIDI Port)'}
	];
	
	self.MSC_deviceid = [];
	
	try {
		self.system.emit('midi_devices_list', (data) => { //do the callback thing from companion to get the list
			self.MIDI_outputs = data;
			let listObj = {};
			for (var i = 0; i < self.MIDI_outputs.output_list.length; i++) {
				listObj = {};
				listObj.id = self.MIDI_outputs[i].name;
				listObj.label = self.MIDI_outputs[i].name;
				self.MIDI_outputs_list.push(listObj);
			}
	
			///build MIDI Show Control Device ID list
			for (let i = 0; i < 112; i++) {
				listObj = {};
				listObj.id = i;
				listObj.label = i + '';
				self.MSC_deviceid.push(listObj);
			}
			for (let i = 1; i < 16; i++) {
				listObj = {};
				listObj.id = 'g' + i;
				listObj.label = 'Group ' + i;
				self.MSC_deviceid.push(listObj);
			}
			listObj = {};
			listObj.id = 'all';
			listObj.label = 'All Devices';
			self.MSC_deviceid.push(listObj);
	
			self.actions(); // export actions
			
			self.status(self.STATUS_OK);			
		});
	}
	catch(error) {
		let errorMessage = 'Error occurred getting MIDI output ports.';
		self.log('error', errorMessage);
		self.status(self.STATUS_ERROR, errorMessage);
	}
	
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [

	]
}

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this;

	debug('destroy', self.id);
}

instance.prototype.actions = function (system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'midi_noteon': {
			label: 'Send Note On',
			options: [
				{
					type: 'dropdown',
					label: 'MIDI Port',
					id: 'midiport',
					choices: self.MIDI_outputs_list,
					default: '0',
					tooltip: 'MIDI Port to control.'
				},
				{
					type: 'number',
					label: 'Channel',
					id: 'channel',
					min: 1,
					max: 16,
					default: 1,
					required: true,
					range: true
				},
				{
					type: 'dropdown',
					label: 'MIDI Note',
					id: 'note',
					choices: self.MIDI_notes,
					default: '21',
				},
				{
					type: 'number',
					label: 'Velocity',
					id: 'velocity',
					min: 0,
					max: 127,
					default: 100,
					required: true,
					range: true
				}
			]
		},
		'midi_noteoff': {
			label: 'Send Note Off',
			options: [
				{
					type: 'dropdown',
					label: 'MIDI Port',
					id: 'midiport',
					choices: self.MIDI_outputs_list,
					default: '0',
					tooltip: 'MIDI Port to control.'
				},
				{
					type: 'number',
					label: 'Channel',
					id: 'channel',
					min: 1,
					max: 16,
					default: 1,
					required: true,
					range: true
				},
				{
					type: 'dropdown',
					label: 'MIDI Note',
					id: 'note',
					choices: self.MIDI_notes,
					default: '21',
				},
				{
					type: 'number',
					label: 'Velocity',
					id: 'velocity',
					min: 0,
					max: 127,
					default: 100,
					required: true,
					range: true
				}
			]
		},
		'aftertouch': {
			label: 'Send Polyphonic Aftertouch',
			options: [
				{
					type: 'dropdown',
					label: 'MIDI Port',
					id: 'midiport',
					choices: self.MIDI_outputs_list,
					default: '0',
					tooltip: 'MIDI Port to control.'
				},
				{
					type: 'number',
					label: 'Channel',
					id: 'channel',
					min: 1,
					max: 16,
					default: 1,
					required: true,
					range: true
				},
				{
					type: 'dropdown',
					label: 'MIDI Note',
					id: 'note',
					choices: self.MIDI_notes,
					default: '21',
				},
				{
					type: 'number',
					label: 'Value',
					id: 'value',
					min: 0,
					max: 127,
					default: 0,
					required: true,
					range: true
				}
			]
		},
		'cc': {
			label: 'Send Control Change',
			options: [
				{
					type: 'dropdown',
					label: 'MIDI Port',
					id: 'midiport',
					choices: self.MIDI_outputs_list,
					default: '0',
					tooltip: 'MIDI Port to control.'
				},
				{
					type: 'number',
					label: 'Channel',
					id: 'channel',
					min: 1,
					max: 16,
					default: 1,
					required: true,
					range: true
				},
				{
					type: 'dropdown',
					label: 'Controller',
					id: 'controller',
					default: '0',
					choices: self.MIDI_controllers
				},
				{
					type: 'number',
					label: 'Value',
					id: 'value',
					min: 0,
					max: 127,
					default: 100,
					required: true,
					range: true
				}
			]
		},
		'pc': {
			label: 'Send Program Change',
			options: [
				{
					type: 'dropdown',
					label: 'MIDI Port',
					id: 'midiport',
					choices: self.MIDI_outputs_list,
					default: '0',
					tooltip: 'MIDI Port to control.'
				},
				{
					type: 'number',
					label: 'Channel',
					id: 'channel',
					min: 1,
					max: 16,
					default: 1,
					required: true,
					range: true
				},
				{
					type: 'number',
					label: 'Value',
					id: 'value',
					min: 0,
					max: 127,
					default: 0,
					required: true,
					range: true
				}
			]
		},
		'pressure': {
			label: 'Send Channel Pressure / Aftertouch',
			options: [
				{
					type: 'dropdown',
					label: 'MIDI Port',
					id: 'midiport',
					choices: self.MIDI_outputs_list,
					default: '0',
					tooltip: 'MIDI Port to control.'
				},
				{
					type: 'number',
					label: 'Channel',
					id: 'channel',
					min: 1,
					max: 16,
					default: 1,
					required: true,
					range: true
				},
				{
					type: 'number',
					label: 'Value',
					id: 'value',
					min: 0,
					max: 127,
					default: 0,
					required: true,
					range: true
				}
			]
		},
		'pitchbend': {
			label: 'Send Pitch Bend',
			options: [
				{
					type: 'dropdown',
					label: 'MIDI Port',
					id: 'midiport',
					choices: self.MIDI_outputs_list,
					default: '0',
					tooltip: 'MIDI Port to control.'
				},
				{
					type: 'number',
					label: 'Channel',
					id: 'channel',
					min: 1,
					max: 16,
					default: 1,
					required: true,
					range: true
				},
				{
					type: 'number',
					label: 'Value',
					id: 'value',
					min: 0,
					max: 16383,
					default: 8192,
					required: true,
					range: true
				}
			]
		},
		'msc_command': {
			label: 'Send MSC Command',
			options: [
				{
					type: 'dropdown',
					label: 'MIDI Port',
					id: 'midiport',
					choices: self.MIDI_outputs_list,
					default: '0',
					tooltip: 'MIDI Port to control.'
				},
				{
					type: 'dropdown',
					label: 'Device ID',
					id: 'deviceid',
					choices: self.MSC_deviceid,
					default: '0',
					tooltip: 'Device ID to target.'
				},
				{
					type: 'dropdown',
					label: 'Command Format',
					id: 'commandformat',
					choices: self.MSC_commandformat,
					default: 'lighting.general'
				},
				{
					type: 'dropdown',
					label: 'Command',
					id: 'command',
					choices: self.MSC_command,
					default: 'go'
				},
				{
					type: 'textinput',
					label: 'Cue (optional)',
					id: 'cue',
					default: ''
				},
				{
					type: 'textinput',
					label: 'Cue List (optional)',
					id: 'cuelist',
					default: ''
				},
				{
					type: 'textinput',
					label: 'Cue Path (optional)',
					id: 'cuepath',
					default: ''
				}
			]
		},
		'sysex': {
			label: 'Send SysEx MIDI Message',
			options: [
				{
					type: 'dropdown',
					label: 'MIDI Port',
					id: 'midiport',
					choices: self.MIDI_outputs_list,
					default: '0',
					tooltip: 'MIDI Port to control.'
				},
				{
					type: 'textinput',
					label: 'SysEx MIDI Message in hexadecimal or decimal, separated by spaces or commas',
					id: 'message',
					default: '0'
				}
			]
		}
	});
};

instance.prototype.action = function (action) {
	var self = this;
	var options = action.options;
		
	let midiObj = null;
	
	switch (action.action) {
		case 'midi_noteon':
			midiObj = {
				midiport: options.midiport,
				midicommand: 'noteon',
				channel: parseInt(options.channel)-1,
				note: parseInt(options.note),
				velocity: parseInt(options.velocity)
			};
			break;
		case 'midi_noteoff':
			midiObj = {
				midiport: options.midiport,
				midicommand: 'noteoff',
				channel: parseInt(options.channel)-1,
				note: parseInt(options.note),
				velocity: parseInt(options.velocity)
			};
			break;
		case 'aftertouch':
			midiObj = {
				midiport: options.midiport,
				midicommand: 'aftertouch',
				channel: parseInt(options.channel)-1,
				note: parseInt(options.note),
				value: parseInt(options.value)
			};
			break;
		case 'cc':
			midiObj = {
				midiport: options.midiport,
				midicommand: 'cc',
				channel: parseInt(options.channel)-1,
				controller: parseInt(options.controller),
				value: parseInt(options.value) 
			};
			break;
		case 'pc':
			midiObj = {
				midiport: options.midiport,
				midicommand: 'pc',
				channel: parseInt(options.channel)-1,
				value: parseInt(options.value)
			};
			break;
		case 'pressure':
			midiObj = {
				midiport: options.midiport,
				midicommand: 'pressure',
				channel: parseInt(options.channel)-1,
				value: parseInt(options.value)
			};
			break;
		case 'pitchbend':
			midiObj = {
				midiport: options.midiport,
				midicommand: 'pitchbend',
				channel: parseInt(options.channel)-1,
				value: parseInt(options.value)
			};
			break;
		case 'msc_command':
			midiObj = {
				midiport: options.midiport, 
				midicommand: 'msc', 
				deviceid: options.deviceid, 
				commandformat: options.commandformat, 
				command: options.command, 
				cue: options.cue, 
				cuelist: options.cuelist, 
				cuepath: options.cuepath
			};
			break;
		case 'sysex':			
			midiObj = {
				midiport: options.midiport,
				midicommand: 'sysex',
				message: options.message
			};
			break;
		default:
			break;
	}
	
	if (midiObj !== null) {
		try {
			//send midi here
		}
		catch(error) {
			let errorMessage = 'Error occurred sending MIDI message.';
			self.log('error', errorMessage);
			self.status(self.STATUS_ERROR, errorMessage);
		}
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
/*jslint node: true */
"use strict";


var serialportLib = require("serialport");
var SerialPort = serialportLib.SerialPort;

var efbParser = function (emitter, buffer) {
	//console.log(emitter);
	emitter.emit("data", buffer);
}

var DEFAULT_EFB_DATA_CALLBACK = function(data) {
	console.log("here is default data callback");
	console.log(data);
}


var DEFAULT_SERIAL_OPTION = {
	baudrate: 9600,
	databits: 8,
	parity: "none", 
	stopbits: 1,
	flowcontrol : false,
	parser: efbParser,
	//dataCallback: DEFAULT_EFB_DATA_CALLBACK, 
};

var cnt = 100;

var SerialPortBean = function(portName, options) {
	var self = this;
	this.portName = portName;
	this.options = options;
	this.serialport = undefined;
	this.isGadget = false;
	this.id = cnt;

	cnt ++;

	this.makeDataCallback = function() {
		console.log("my id is " + self.id);
		console.log("self is " + self.portName);
		return function(data) {
			console.log("my id is " + self.id);
			// here this is the right serialport.options
			// but self always same
			console.log(self.id);
			console.log(self.portName + " got data: " + data.toString());
		};
	};

	this.dataCallback = function(data) {
		console.log(self);
		console.log(self.portName + " got data: " + data.toString());
	};

	options.dataCallback = this.makeDataCallback();

	this.sendRequestPacket = function(){
		console.log("my id is " + self.id);
		self.serialport.write("?", function(err, bytesSent){
			if (err) {
				console.log(self.portName + " send failure");
			} else {
				console.log(self.portName + " " + bytesSent + " bytes sent");
			}
		});
	}, 


	this.onOpen = function(err) {
		console.log("my id is " + self.id);
		if (err)
		{
			console.log(self.portName + " open failure");
		} else {
			console.log(self.portName + " opened");

			setTimeout(self.sendRequestPacket, 2000);
		}

		
	};

	this.connect = function(){
		console.log("my id is " + self.id);
		var sp = new SerialPort(this.portName, this.options, false);
		this.serialport = sp;

		sp.on("open", this.onOpen);

		sp.open(function(err) {

		});
	};

	console.log("my id is " + this.id);
};



var efb = {
	getAllSerialPortName: function(callback){
		serialportLib.list(function(err, ports){
			if (err)
			{
				callback(err, null);
				return ;
			}
			var serialPortNameList = [];
			ports.forEach(function(port){
				serialPortNameList[serialPortNameList.length] = port.comName;
			});

			callback(null, serialPortNameList);
		});
	}, 

	openSerialPort: function(serialPortNameList){
		serialPortNameList.forEach(function(portName) {
			var spb = new SerialPortBean(portName, DEFAULT_SERIAL_OPTION);
			spb.connect();
		});
	}, 
};


efb.getAllSerialPortName(function(err, namelist){
	console.log(namelist.length + " serial port(s) found.");

	efb.openSerialPort(namelist, function(err){
	});
});


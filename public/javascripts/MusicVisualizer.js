function MusicVisualizer(obj) {
	// constructor...
	this.source = null;
	this.count = 0;
	this.analyser = MusicVisualizer.ac.createAnalyser();

	this.size = obj.size;
	this.analyser.fftSize = this.size * 2;

	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain" : "createGainNode"]();
	this.gainNode.connect(MusicVisualizer.ac.destination);

	this.analyser.connect(this.gainNode);

	this.xhr = new XMLHttpRequest();

	this.visualizer = obj.visualizer;

	this.visualize();
	//**
	this.startTime = 0;
	this.pauseTime = 0;
	this.offsetTime = 0;
	this.durationTime = 0;
	this.percent2 = 0;
}

MusicVisualizer.ac = new (window.AudioContext||window.webkitAudioContext)();

/*setInterval(function(){
	MusicVisualizer.currentTime = MusicVisualizer.ac.currentTime;
},16)*/


MusicVisualizer.prototype.load = function(url, fun){
	this.xhr.abort();
	this.xhr.open("GET", url);
	this.xhr.responseType = "arraybuffer";
	var self = this;
	this.xhr.onload = function(){
		fun(self.xhr.response);
	} 

	this.xhr.send();
}

MusicVisualizer.prototype.decode = function(arraybuffer, fun){
	MusicVisualizer.ac.decodeAudioData(arraybuffer, function(buffer){
		fun(buffer);
	},function(err){
		console.log(err);
	})
}

MusicVisualizer.prototype.play = function(url, offset, loop){

	var n = ++this.count;
	var self = this;
	//this.duration = 0;
	//this.startTime = MusicVisualizer.ac.currentTime;
	//console.log("伪开始时间戳"+MusicVisualizer.ac.currentTime)
	

	this.source && this.stop();
	this.load(url, function(arraybuffer){
		if(n != self.count) return;
		self.decode(arraybuffer, function(buffer){
			if(n != self.count) return;
			var bs = MusicVisualizer.ac.createBufferSource();
			bs.connect(self.analyser);
			bs.buffer = buffer;

			
			bs[bs.start ? "start" : "noteOn"](0,offset);
			clearInterval( timer );
			//***开始时间戳
			console.log("真正的开始时间戳" + MusicVisualizer.ac.currentTime);
			self.startTime = MusicVisualizer.ac.currentTime;


			bs.loop = loop || false;
			self.durationTime = bs.buffer.duration;
			console.log(self.durationTime);
			

			if( self.offsetTime == 0 ){
				console.log(1);
				clearInterval( timer );
				pro( MusicVisualizer.ac.currentTime );
				wating = MusicVisualizer.ac.currentTime;
				console.log("第一次wating  " + wating);
			}else{
				console.log(2);
				clearInterval( timer );
				wating += MusicVisualizer.ac.currentTime - self.pauseTime;
				console.log( "传进定时器的时间戳  "+ wating )
				pro( wating );
			}

			bs.onended = function(){
				clearInterval( timer );

			}
			//***
			self.source = bs;
			//console.log(bs.currentTime);
		})
	});
}

MusicVisualizer.prototype.stop = function(){
	if( !this.source ) return;
	this.source[this.source.stop ? "stop" : "noteOff"](0);

	//**结束时间戳
	/*this.pauseTime = MusicVisualizer.ac.currentTime;
	console.log( "暂停时间戳1  "+this.pauseTime )*/
	//offset += this.pauseTime - this.startTime;
	//**
}

MusicVisualizer.prototype.changeVolume = function(percent){
	this.gainNode.gain.value = percent * percent;
}

MusicVisualizer.prototype.visualize = function(){
	var arr=new Uint8Array(this.analyser.frequencyBinCount);
	
	requestAnimationFrame = window.requestAnimationFrame||
							window.webkitRequestAnimationFrame||
							window.mozRequestAnimationFrame;

	var self = this;
	function v(){
		self.analyser.getByteFrequencyData(arr);
		//console.log(arr);
		self.visualizer(arr);
		requestAnimationFrame(v);
	}						
	requestAnimationFrame(v);
}
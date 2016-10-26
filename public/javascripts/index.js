function $(s){
	return document.querySelectorAll(s);
}

var lis = $("#list li");

var size = 32;
var box = $("#box")[0];
var height,width;
var canvas = document.createElement("canvas");
	box.appendChild(canvas);
var ctx = canvas.getContext('2d');

var waterMarkCanvas = document.getElementById("waterMark");
var waterContext = waterMarkCanvas.getContext('2d');
var Dots = [];
var line;
var oAudio = document.getElementsByTagName('audio')[0];
var mv = new MusicVisualizer({
	size: size,
	visualizer: draw
});
var oPause = document.querySelector("#pause");
var oStart = document.querySelector("#start");
var offset = 0,
	startTime = 0,
	pauseTime = 0,
	duration = 0;
var deltaTime;	

var oBar = document.getElementById('bar');
var progress = document.getElementById('progress-bar');
var timer = null;
var barWidth = progress.getBoundingClientRect().width;

var wating = 0;

var bOk = false;


waterContext.font = "bold 20px Arial";
waterContext.fillStyle = "rgba(255,255,255,0.5)";
waterContext.textBaseline = "middle";
waterContext.fillText("== 音乐播放器 ==", 0, 50);


canvas.style.background = "url(images/game_bg_2_hd.jpg)";
canvas.style.backgroundSize = "cover";

//start = MusicVisualizer.ac.currentTime;
for( let i = 0; i < lis.length; i++ ){
	lis[i].timer = null;
	lis[i].onclick = function(){
		clearInterval( timer );
		//alert(1)
		for(var j = 0 ; j < lis.length; j++){
			lis[j].className = "";
		}
		this.className = "selected";
		//load("/media/"+this.title)
		mv.play("/media/" + this.title);
		oStart.dataset.title = this.title;
		//console.log(MusicVisualizer.ac.currentTime);
		offset = 0;
		wating = 0;
		mv.offsetTime = offset;
		bOk = false;
	}
}

//console.log(duration);


oPause.onclick = function(){
	if( bOk ) return;
	mv.stop();
	bOk = true;
	//记录暂停时间戳
	mv.pauseTime = MusicVisualizer.ac.currentTime;
	pauseTime = mv.pauseTime;

	   	console.log("pauseTime:"+pauseTime)

	deltaTime = pauseTime - mv.startTime;

		console.log("deltaTime:"+deltaTime)
	clearInterval(timer)	

}

oStart.onclick = function(){
	if( !this.dataset.title ) return;
	if( !bOk ) return;
	bOk = false;
	offset = offset + deltaTime;
	mv.offsetTime = offset;
		console.log("offset:"+offset);
	
	mv.play("/media/" + this.dataset.title, offset);

	clearInterval(timer);
	
}

function random(n, m){
	return Math.round(Math.random() * ( m - n ) + n );
}

function getDots(){
	Dots = [];
	for(var i = 0; i < size; i++){
		var x = random(0, width);
		var y = random(0, height);
		var color = "rgba(" + random(100,250) + "," + random(50,250) + "," + random(50,100) + ","+0.1+")";
		Dots.push({
			x:       x,
			y:       y,
			dx:      random(1, 4),
			color:   color,
			cap:     0,
			dotMode: "random"
		})
		Dots[i].dx2 = Dots[i].dx;
	}
}


function resize(){
	height = box.clientHeight;
	width = box.clientWidth;
	canvas.height = height;
	canvas.width = width;
	barWidth = progress.getBoundingClientRect().width;
	line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0, "#DC143C");
	line.addColorStop(0.5, "#FFFF00");
	line.addColorStop(1, "#7CFC00");
	getDots();
}
resize();
window.onresize = resize;


function draw(arr){
	ctx.clearRect(0, 0, width, height);
	var w = width/size;
	var cw = w * 0.8;
	var capH = cw > 10 ? 10 : cw; 
	ctx.fillStyle = line;
	
	for(var i = 0; i < size; i++){

		var o = Dots[i]; 

		if(draw.type == "column"){
			var h = arr[i]/256*height;
			ctx.fillRect( w*i, height - h, cw, h);
			ctx.fillRect( w*i, height - (o.cap + capH), cw, capH);
			o.cap--;
			if(o.cap < 0){
				o.cap = 0;
			}

			if(h > 0 && o.cap < h + 40){
				o.cap = h + 40 > height - capH ? height - capH : h + 40;
			}
		}else if(draw.type == "dot"){
			
			ctx.beginPath();
			//重叠部分颜色融合
			ctx.globalCompositeOperation = "lighter";
			var o = Dots[i];
			var r = 25 + arr[i] / 256 * (height > width ? width : height) / 10;
			ctx.arc(o.x, o.y, r , 0 , Math.PI*2, true);

			var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
			g.addColorStop(0, "#fff");
			g.addColorStop(0.9, o.color);
			g.addColorStop(1, o.color);
			ctx.fillStyle = g;
			ctx.fill();
			
			o.x += o.dx;
			o.x = o.x > width ? 0 : o.x; 
			//ctx.strokeStyle="#fff";
			//ctx.stroke();
		}
		
	}

	ctx.drawImage( waterMarkCanvas , canvas.width / 2 - waterMarkCanvas.width / 2, 0)

}

draw.type = "column";

var types = $("#type li");
for(var i = 0; i < types.length; i++){
	types[i].onclick = function(){
		for(var j = 0; j < types.length; j++){
			types[j].className = "";
		}
		this.className = "selected";
		draw.type = this.getAttribute("data-type");
	}
}


canvas.onclick = function(){
	
	if( draw.type == "dot" ){
		for(var i = 0; i < size; i++){
			Dots[i].dotMode == "random" ? Dots[i].dx = 0 : Dots[i].dx = Dots[i].dx2;
			Dots[i].dotMode = Dots[i].dotMode == "static" ? "random" : "static";
		}
	}
} 


$("#volume")[0].oninput = function(){
	mv.changeVolume(this.value/this.max);
}

$("#volume")[0].oninput();
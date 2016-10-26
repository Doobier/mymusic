//progress bar




function pro(time){

	timer = setInterval(function(){
		//console.log("定时器里的开始时间戳" + time)
		oBar.style.width = barWidth * ( MusicVisualizer.ac.currentTime - time) / mv.durationTime + 'px';
		
		if( oBar.getBoundingClientRect().width >= barWidth ){
			clearInterval( timer )
		}
	},16)
}




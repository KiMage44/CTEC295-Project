



window.addEventListener("load", () =>{

	var canvas = document.getElementById("drawingCanvas");
	var context = canvas.getContext ("2d");
	var canvasColor = document.getElementById("canBkgColor");
	
	
	document.getElementById('lineWidth').addEventListener('change', function(){
		context.lineWidth = document.getElementById('lineWidth').value;
	}, false);
	
	
	resize();
	
	function resize() {
		
		context.canvas.width = window.innerWidth - 200;
		context.canvas.height = window.innerHeight - 200;
			
	}
	
	
	
	var pos = {x: 0, y: 0};
	
	function setPosition(e) {
		
		pos.x = e.clientX - canvas.offsetLeft;
		pos.y = e.clientY - canvas.offsetTop;
		
	}
	
	
	
	function draw(e) {
		
		if (e.buttons !==1) return;
	
		context.beginPath();
		context.LineWidth = lineWidth.value;
		context.lineCap = "round";
		context.strokeStyle = setColor();
		context.moveTo(pos.x, pos.y);
		setPosition(e);
		context.lineTo(pos.x, pos.y);
		context.stroke();
			
	}
	
	
	
	function setColor(){
		return document.querySelector(".color").value;
	}
	
	
	function setBackgroundColor(){
		context.save();
		context.fillStyle = document.getElementById("canBkgColor").value;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.restore();
	}
	
	
	
	
	window.addEventListener("resize", resize);
	
	
	
	document.addEventListener("mousemove", draw);
	document.addEventListener("mousedown", setPosition);
	document.addEventListener("mouseenter", setPosition);
	canvasColor.addEventListener("input", setBackgroundColor, false);
	
	
});	



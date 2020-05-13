window.onload = function() { pendulum(); }

// pendulum physics and graphics
function pendulum() {

	// positioning variables
	var xpos, ypos, mousex, mousey;
	var ballClicked = false, paused = false;
	var showForces = false, showVelocity = false, showAcceleration = false;

	// physics variables
	var length, mass, damping;   // user defined parameters
	var velocity, acceleration;  // vector parameters
	var omega, alpha, angle;     // repositioning parameters
	var g = 9.81/100;  // gravity

	// canvas
	var canvas = document.getElementById("pendulum");
	var ctx = canvas.getContext("2d");
	var pauseButton = new PauseButton(canvas, 540, 480, 32, false, "cyan");
	var resetButton = new ResetButton(canvas, 540, 540, 32, "cyan");

	// slider objects
	var lengthSlider = new Slider(canvas, "Length", 30, 490, 50, 200, 120, 1, "cm");
	var massSlider = new Slider(canvas, "Mass", 30, 530, 5, 40, 20, 1, "g");
	var dampingSlider = new Slider(canvas, "Damping", 30, 570, 0, 1, 0, 0.1);
	var sliders = [lengthSlider, massSlider, dampingSlider];

	// checkbox objects
	var forceCheckbox = new Checkbox(canvas, "Forces", 380, 500, "yellow");
	var velocityCheckbox = new Checkbox(canvas, "Velocity", 380, 530, "red");
	var accelerationCheckbox = new Checkbox(canvas, "Acceleration", 380, 560, "magenta");
	var checkboxes = [forceCheckbox, velocityCheckbox, accelerationCheckbox];

	// vector objects
	var fgravVector, ftangVector, fcentVector, ftensVector;
	var vVector, atangVector, acentVector, anetVector;
	var fmax, vmax, amax, thetamax;

	// reset simluation
	function reset() {
		ballClicked = false;
		omega = 0.0;
		alpha = 0.0;
		angle = Math.PI/3;
		thetamax = angle;
		velocity = 0.0;
		length = lengthSlider.value;
		mass = massSlider.value;
		damping = dampingSlider.value;
		xpos = canvas.width/2 + length*Math.sin(angle);
		ypos = canvas.height/8 + length*Math.cos(angle);
		// create vectors
		fgravVector = new Vector(canvas, xpos, ypos, mass*g/10, Math.PI/2);
		ftangVector = new Vector(canvas, xpos, ypos, mass*g/10*Math.cos(Math.PI/3), Math.PI/6, true);
		fcentVector = new Vector(canvas, xpos, ypos, mass*g/10*Math.sin(Math.PI/3), 2*Math.PI/3, true);
		ftensVector = new Vector(canvas, xpos, ypos, mass*g/10*Math.cos(Math.PI/3), 7*Math.PI/6);
		vVector = new Vector(canvas, xpos, ypos, 0, 4*Math.PI/3, false, "red");
		atangVector = new Vector(canvas, xpos, ypos, g*Math.sin(angle), Math.PI/6, true, "magenta");
		acentVector = new Vector(canvas, xpos, ypos, omega*length, 2*Math.PI/3, true, "magenta");
		anetVector = new Vector(canvas, xpos, ypos, g/10*Math.sqrt(7)/2, Math.atan2(Math.sqrt(3)/7)+Math.PI/2, false, "magenta");
	}

	// main redraw function
	function redraw() {
		// draw canvas
		ctx.strokeStyle = "cyan";
		ctx.fillStyle = "black";
		ctx.beginPath();
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.stroke();

		// handle physics
		if (!ballClicked && !paused) {
			alpha = -0.2*g/length * Math.sin(angle);
			omega += alpha;
			omega *= (1 - damping*0.01);
			angle += omega;
		}
		// handle mouse drag
		else if (ballClicked) {
			dx = mousex - canvas.width/2;
			dy = mousey - canvas.height/8;
			angle = Math.atan2(-1*dy, dx) + Math.PI/2;
			thetamax = angle;
		}
		xpos = canvas.width/2 + 1.5*length*Math.sin(angle);
		ypos = canvas.height/8 + 1.5*length*Math.cos(angle);

		// draw string
		ctx.shadowBlur = 0;
		ctx.fillStyle = "cyan";
		ctx.strokeStyle = "white";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(xpos, ypos);
		ctx.lineTo(canvas.width/2, canvas.height/8);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(canvas.width/2, canvas.height/8, 3, 0, 2*Math.PI);
		ctx.fill();

		// draw ball
		if (ballClicked)
			ctx.shadowBlur = 12;
		else
			ctx.shadowBlur = 0;
		ctx.shadowColor = "#66FF66";
		ctx.lineWidth = 3;
		ctx.strokeStyle = "#00FF00";
		ctx.fillStyle = "black";
		ctx.beginPath();
		ctx.arc(xpos, ypos, mass*1.5, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.shadowBlur = 0;

		// draw force vectors
		let trans = mass/2, scale = 500;
		let weight = scale*mass*g/10+trans;
		let ftens = weight*Math.cos(angle) + scale/5*mass*Math.pow(omega*length, 2)/length;
		if (showForces) {
			fgravVector.drawVector(xpos, ypos, weight, Math.PI/2);
			ftangVector.drawVector(xpos, ypos, weight*Math.cos(angle), Math.PI/2-angle);
			fcentVector.drawVector(xpos, ypos, weight*Math.sin(angle), Math.PI-angle);
			ftensVector.drawVector(xpos, ypos, ftens, 3*Math.PI/2-angle);
		}

		// draw acceleration vector
		vmax = Math.sqrt(2*g*length*(1-Math.cos(Math.PI/2)));
		velocity = Math.sqrt(2*g*length*(Math.cos(angle)-Math.cos(thetamax)));
		acceleration = g*Math.sin(angle);
		amax = Math.sqrt(Math.pow(g, 2) + Math.pow(Math.pow(vmax, 2)/length, 2));
		//velocity = omega*5*length;
		if (showAcceleration) {
			if (ballClicked) {
				anetVector.drawVector(xpos, ypos, acceleration/amax*160, Math.PI-angle);
			}
			else {
				let atang = g*Math.sin(angle);
				let acent = Math.pow(velocity, 2)/length;
				let anet = Math.sqrt(Math.pow(atang, 2) + Math.pow(acent, 2));
				let phi = Math.atan(atang/acent);
				if (angle > 0)
					atang *= -1;
				//atangVector.drawVector(xpos, ypos, scale*3*atang, Math.PI/2-angle);
				//acentVector.drawVector(xpos, ypos, scale*6*acent, Math.PI-angle);
				anetVector.drawVector(xpos, ypos, anet/amax*160, 3*Math.PI/2-angle-phi);
				acceleration = anet;
			}
		}
		// draw velocity vector
		if (omega > 0)
			velocity *= -1;
		if (showVelocity && !ballClicked) {
			vVector.drawVector(xpos, ypos, velocity/vmax*80, Math.PI-angle);
		}

		// draw UI border
		ctx.shadowBlur = 0;
		ctx.fillStyle = "black";
		ctx.beginPath();
		ctx.rect(1, 0.75*canvas.height-5, canvas.width-2, 0.25*canvas.height-6);
		ctx.fill();
		ctx.beginPath();
		ctx.strokeStyle = "cyan";
		ctx.lineWidth = 1;
		ctx.moveTo(0, 0.75*canvas.height-5);
		ctx.lineTo(canvas.width, 0.75*canvas.height-5);
		ctx.stroke();
		ctx.stroke();
		//ctx.strokeStyle="black";

		// draw sliders
		length = lengthSlider.value;
		mass = massSlider.value;
		damping = dampingSlider.value;
		for (let i = 0; i < sliders.length; i++) {
			sliders[i].drawSlider();
		}

		// draw checkboxes
		for (let i = 0; i < checkboxes.length; i++) {
			checkboxes[i].drawCheckbox();
		}

		// draw buttons
		pauseButton.drawButton();
		resetButton.drawButton();

		// write labels
		ctx.shadowBlur = 0;
		ctx.font = "10pt Verdana";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		// angle
		if (ballClicked || paused) {
			let theta = angle*180/Math.PI % 360;
			ctx.fillText("Angle: \u03b8 = " + theta.toFixed(0) + "\xB0", canvas.width/2, canvas.height/8 - 15);
		}
		// period
		//let period = 2*Math.PI*Math.sqrt(0.01*length/9.81);
		//ctx.fillText("Period: " + period.toFixed(2) + " s", canvas.width/2, canvas.height*4/5-20);
	}

	reset();
	setInterval(redraw, 1);

	// mouse click listener
	canvas.onmousedown = function(e) {
		var x = e.clientX - canvas.offsetLeft;
		var y = e.clientY - canvas.offsetTop;
		// ball is clicked
		if (Math.sqrt(Math.pow(xpos-x, 2) + Math.pow(ypos-y, 2)) < 1.5*mass) {
			ballClicked = true;
			mousex = x;
			mousey = y;
		}
		// slider is clicked
		for (let i = 0; i < sliders.length; i++) {
			if (Math.sqrt(Math.pow(sliders[i].valuex-x, 2) + Math.pow(sliders[i].valuey-y, 2)) < 7) {
				sliders[i].dragged = true;
				mousex = x;
				mousey = y;
				break;
			}
		}
		// show force vectors clicked
		if (Math.sqrt(Math.pow(forceCheckbox.x-x, 2) + Math.pow(forceCheckbox.y-y, 2)) < forceCheckbox.width+2) {
			showForces = !showForces;
			forceCheckbox.selected = !forceCheckbox.selected;
		}
		// show velocity vectors clicked
		if (Math.sqrt(Math.pow(velocityCheckbox.x-x, 2) + Math.pow(velocityCheckbox.y-y, 2)) < velocityCheckbox.width+2) {
			showVelocity = !showVelocity;
			velocityCheckbox.selected = !velocityCheckbox.selected;
		}
		// show acceleration vectors clicked
		if (Math.sqrt(Math.pow(accelerationCheckbox.x-x, 2) + Math.pow(accelerationCheckbox.y-y, 2)) < accelerationCheckbox.width+2) {
			showAcceleration = !showAcceleration;
			accelerationCheckbox.selected = !accelerationCheckbox.selected;
		}
		// pause button clicked
		if (Math.sqrt(Math.pow(pauseButton.x+pauseButton.width/2-x, 2) + Math.pow(pauseButton.y+pauseButton.width/2-y, 2)) < 3*pauseButton.width/4) {
			paused = !paused;
			pauseButton.selected = !pauseButton.selected;
		}
		// reset button clicked
		if (Math.sqrt(Math.pow(resetButton.x+resetButton.width/2-x, 2) + Math.pow(resetButton.y+resetButton.width/2-y, 2)) < 3*resetButton.width/4) {
			reset();
		}
	}
	// mouse motion listener
	canvas.onmousemove = function(e) {
		var x = e.clientX - canvas.offsetLeft;
		var y = e.clientY - canvas.offsetTop;
		if (ballClicked) {
			mousex = x;
			mousey = y;
		}
		for (let i = 0; i < sliders.length; i++) {
			sliders[i].hover = Math.sqrt(Math.pow(sliders[i].valuex-x, 2) + Math.pow(sliders[i].valuey-y, 2)) < 7;
			if (sliders[i].dragged) {
				sliders[i].hover = true;
				let location = x - sliders[i].x;
				if (location < 0)
					location = 0;
				else if (location > canvas.width/2)
					location = canvas.width/2;
				let increment = (sliders[i].max-sliders[i].min)/sliders[i].step;
				if (increment > canvas.width/2)
					increment = 1;
				else increment = (canvas.width/2)/increment;
				location = Math.ceil(location/increment) * increment;
				sliders[i].value = (location/(canvas.width/2))*(sliders[i].max-sliders[i].min)+sliders[i].min;
				sliders[i].valuex = sliders[i].x+location;
			}
		}
		for (let i = 0; i < checkboxes.length; i++) {
			checkboxes[i].hover = Math.sqrt(Math.pow(checkboxes[i].x-x, 2) + Math.pow(checkboxes[i].y-y, 2)) < checkboxes[i].width+2;
		}
		pauseButton.hover = Math.sqrt(Math.pow(pauseButton.x+pauseButton.width/2-x, 2) + Math.pow(pauseButton.y+pauseButton.width/2-y, 2)) < 3*pauseButton.width/4;
		resetButton.hover = Math.sqrt(Math.pow(resetButton.x+resetButton.width/2-x, 2) + Math.pow(resetButton.y+resetButton.width/2-y, 2)) < 3*resetButton.width/4;
	}
	// release mouse click listener
	canvas.onmouseup = function(e) {
		if (ballClicked) {
			omega = 0.0;
			ballClicked = false;
			if (angle == Math.PI)
				angle -= 0.01;
		}
		for (let i = 0; i < sliders.length; i++) {
			if (sliders[i].dragged) {
				sliders[i].dragged = false;
			}
		}
	}
}

// slider object
class Slider {

  constructor(canvas, label, x, y, min, max, value, step, unit, color) {
    // slider variables
    this.canvas = canvas;
    this.label = label;
    this.x = x;
    this.y = y;
    this.min = min;
    this.max = max;
    this.value = value;
    this.step = step || 1;
    this.unit = unit || "";
    this.color = color || "#00FFFF";
    this.valuex = x + value/max*(canvas.width/2);
    this.valuey = y;
    this.hover = false;
    this.dragged = false;
  }

  drawSlider() {
    // draw outline
    let canvas = this.canvas;
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y-3);
    ctx.lineTo(this.x+canvas.width/2, this.y-3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x, this.y+3);
    ctx.lineTo(this.x+canvas.width/2, this.y+3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0.5*Math.PI, 1.5*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x+canvas.width/2, this.y, 3, 0.5*Math.PI, 1.5*Math.PI, true);
    ctx.stroke();

    // handle shadow
    ctx.shadowColor = this.color.replace("00", "66");
    if (this.hover)
      ctx.shadowBlur = 12;
    else
      ctx.shadowBlur = 0;

    // draw selector
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.valuex, this.valuey, 6, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();

    // write label
    ctx.shadowBlur = 0;
    ctx.font = "10pt Verdana";
    ctx.fillStyle = this.color;
    ctx.textAlign = "left";
    if (this.step >= 1)
      this.value = Math.round(this.value);
    ctx.fillText(this.label + ": " + this.value + " " + this.unit, this.x+5, this.y-15);
  }
}

// vector object
class Vector {

	constructor(canvas, x, y, magnitude, direction, dotted, color, label, subscript) {
		// vector variables
		this.canvas = canvas;
		this.x = x;
		this.y = y;
		this.magnitude = magnitude;  // in pixels
		this.direction = direction;  // in radians
		this.color = color || "yellow";
		this.dotted = dotted || false;
		this.label = label || "";
		this.subscript = subscript || "";
		this.show = true;
	}

	drawVector(newx, newy, newmag, newdir) {
		// reposition vector
		let ctx = this.canvas.getContext("2d");
		this.x = newx;
		this.y = newy;
		if (newmag < 0) {
			newmag = Math.abs(newmag);
			newdir = Math.PI+newdir;
		}
		this.magnitude = Math.abs(newmag);
		this.direction = newdir;
		if (!this.show || Math.abs(newmag) <= 3)
			return;
		let tox = this.x + this.magnitude*Math.cos(this.direction);
		let toy = this.y + this.magnitude*Math.sin(this.direction);

		// draw vector
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 2;
		if (this.dotted)
			ctx.setLineDash([5, 3]);
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(tox, toy);
		ctx.stroke();
		
		// draw arrow head
		ctx.setLineDash([]);
		ctx.lineJoin = "round";
		ctx.beginPath();
		ctx.moveTo(tox + 8*Math.cos(Math.PI+this.direction-Math.PI/6), toy + 8*Math.sin(Math.PI+this.direction-Math.PI/6));
		ctx.lineTo(tox, toy);
		ctx.lineTo(tox + 8*Math.cos(Math.PI+this.direction+Math.PI/6), toy + 8*Math.sin(Math.PI+this.direction+Math.PI/6));
		ctx.stroke();
		
		// draw label
		if (this.label != "") {
			ctx.font = "10pt Verdana";
			ctx.fillText(this.label, tox+15, toy-5);
			if (this.subscript != "") {
				ctx.font = "6pt Verdana";
				ctx.fillText(this.subscript, tox+20, toy);
			}
		}
	}
}

// pause button object
class PauseButton {

	constructor(canvas, x, y, width, selected, color) {
		// pause button variables
		this.canvas = canvas;
		this.x = x;
		this.y = y;
		this.width = width || 32;
		this.selected = selected || false;
		this.color = color || "#00FFFF";
		this.hover = false;
	}

	drawButton() {
		// draw button
		let canvas = this.canvas;
		let ctx = canvas.getContext("2d");
		ctx.strokeStyle = this.color;
      ctx.fillStyle = this.color;
		ctx.lineWidth = 2;

		// handle shadow
		ctx.shadowColor = this.color.replace("00", "66");
		if (this.hover)
			ctx.shadowBlur = 12;
		else
			ctx.shadowBlur = 0;

		// draw sides
 		ctx.beginPath();
		ctx.moveTo(this.x, this.y-3);
		ctx.lineTo(this.x+this.width, this.y-3);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(this.x+this.width+3, this.y);
		ctx.lineTo(this.x+this.width+3, this.y+this.width);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(this.x, this.y+this.width+3);
		ctx.lineTo(this.x+this.width, this.y+this.width+3);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(this.x-3, this.y);
		ctx.lineTo(this.x-3, this.y+this.width);
		ctx.stroke();

		// draw corners
		ctx.beginPath();
		ctx.arc(this.x, this.y, 3, Math.PI, 3*Math.PI/2);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(this.x+this.width, this.y, 3, 3*Math.PI/2, 2*Math.PI);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(this.x, this.y+this.width, 3, Math.PI/2, Math.PI);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(this.x+this.width, this.y+this.width, 3, 0, Math.PI/2);
		ctx.stroke();

    // draw pause indicator
		if (this.selected) {
			// play symbol edges
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(this.x+this.width/4 + 3*Math.cos(Math.PI/3), this.y+this.width/4 - 3*Math.sin(Math.PI/3));
			ctx.lineTo(this.x+Math.sqrt(3)/2*this.width-3 + 3*Math.cos(Math.PI/3), this.y+this.width/2 - 3*Math.sin(Math.PI/3));
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(this.x+this.width/4 + 3*Math.cos(Math.PI/3), this.y+3*this.width/4 + 3*Math.sin(Math.PI/3));
			ctx.lineTo(this.x+Math.sqrt(3)/2*this.width-3 + 3*Math.cos(Math.PI/3), this.y+this.width/2 + 3*Math.sin(Math.PI/3))
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(this.x+this.width/4-3, this.y+this.width/4);
			ctx.lineTo(this.x+this.width/4-3, this.y+3*this.width/4);
			ctx.stroke();
			// play symbol corners
			ctx.beginPath();
			ctx.arc(this.x+this.width/4, this.y+this.width/4, 3, Math.PI, 5*Math.PI/3); //19*Math.PI/12);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(this.x+this.width/4, this.y+3*this.width/4, 3, Math.PI/3, Math.PI); //5*Math.PI/12, Math.PI);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(this.x+Math.sqrt(3)/2*this.width-3, this.y+this.width/2, 3, 5*Math.PI/3, Math.PI/3);
			ctx.stroke();
		}
		else {
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(this.x+this.width/3, this.y+this.width/4);
      ctx.lineTo(this.x+this.width/3, this.y+3*this.width/4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(this.x+2*this.width/3, this.y+this.width/4);
      ctx.lineTo(this.x+2*this.width/3, this.y+3*this.width/4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.x+this.width/3, this.y+this.width/4, 2.5, 0, 2*Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x+this.width/3, this.y+3*this.width/4, 2.5, 0, 2*Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x+2*this.width/3, this.y+this.width/4, 2.5, 0, 2*Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x+2*this.width/3, this.y+3*this.width/4, 2.5, 0, 2*Math.PI);
      ctx.fill();
		}
	}
}

// reset button object
class ResetButton {

	constructor(canvas, x, y, width, color) {
		// pause button variables
		this.canvas = canvas;
		this.x = x;
		this.y = y;
		this.width = width || 32;
		this.color = color || "#00FFFF";
		this.hover = false;
	}

	drawButton() {
		// draw button
		let canvas = this.canvas;
		let ctx = canvas.getContext("2d");
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 2;

		// handle shadow
		ctx.shadowColor = this.color.replace("00", "66");
		if (this.hover)
			ctx.shadowBlur = 12;
		else
			ctx.shadowBlur = 0;

		// draw sides
 		ctx.beginPath();
		ctx.moveTo(this.x, this.y-3);
		ctx.lineTo(this.x+this.width, this.y-3);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(this.x+this.width+3, this.y);
		ctx.lineTo(this.x+this.width+3, this.y+this.width);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(this.x, this.y+this.width+3);
		ctx.lineTo(this.x+this.width, this.y+this.width+3);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(this.x-3, this.y);
		ctx.lineTo(this.x-3, this.y+this.width);
		ctx.stroke();

		// draw corners
    ctx.beginPath();
		ctx.arc(this.x, this.y, 3, Math.PI, 3*Math.PI/2);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(this.x+this.width, this.y, 3, 3*Math.PI/2, 2*Math.PI);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(this.x, this.y+this.width, 3, Math.PI/2, Math.PI);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(this.x+this.width, this.y+this.width, 3, 0, Math.PI/2);
		ctx.stroke();

    // draw reset symbol
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x+this.width/2, this.y+this.width/2, this.width/3, Math.PI/6, 11*Math.PI/6);
    ctx.stroke();
    let tox = this.x+this.width/2+this.width/3*Math.cos(Math.PI/6);
    let toy = this.y+this.width/2-this.width/3*Math.sin(Math.PI/6);
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(tox+6*Math.cos(5*Math.PI/4-Math.PI/4), toy+6*Math.sin(5*Math.PI/4-Math.PI/4));
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox+6*Math.cos(5*Math.PI/4+Math.PI/4), toy+6*Math.sin(5*Math.PI/4+Math.PI/4));
    ctx.stroke();
	}
}

// checkbox object
class Checkbox {

  constructor(canvas, label, x, y, color, selected, width) {
    // checkbox variables
    this.canvas = canvas;
    this.label = label;
    this.x = x;
    this.y = y;
    this.color = color || "#FFFF00";
    this.selected = selected || false;
    this.width = width || 8;
    this.hover = false;
  }

  drawCheckbox() {
    // draw box
    let canvas = this.canvas;
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = 2;

    //handle shadow
    ctx.shadowColor = this.color.replace("00", "66");
    if (this.hover)
      ctx.shadowBlur = 12;
    else
      ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, 2*Math.PI);
    ctx.stroke();

    // draw select indicator
    if (this.selected) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width-5, 0, 2*Math.PI);
      ctx.fill();
    }

    // write label
    ctx.font = "10pt Verdana";
    ctx.textAlign = "left";
    ctx.fillText(this.label, this.x+16, this.y+4);
  }
}
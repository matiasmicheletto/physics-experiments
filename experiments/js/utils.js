// Canvas
var WIDTH = window.innerWidth; // Ancho de pantalla
var HEIGHT = window.innerHeight; // Alto de pantalla
var canvas = new THREE.WebGLRenderer({antialias: true});
canvas.setSize(	WIDTH, HEIGHT );
document.body.appendChild(canvas.domElement);
window.onresize = function(){
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	canvas.setSize(	WIDTH, HEIGHT );
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

// Escena
var scene = new THREE.Scene;


// VISTA //
var camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 0.1, 10000);
camera.center = { x: 0, y: 0, z: 0 };
camera.updatePosition = function(dist,altitude,azimuth){ // Esta funcion para mover la camara
	this.position.x = dist*Math.sin(altitude)*Math.cos(azimuth) + camera.center.x;
	this.position.z = dist*Math.sin(altitude)*Math.sin(azimuth) + camera.center.z;
	this.position.y = dist*Math.cos(altitude) + camera.center.y;
	this.lookAt(camera.center);
};
var r = 500;
var theta = Math.PI/4;
var phi = Math.PI/4;
var isDragging = false;
var xDown,yDown;
camera.updatePosition(r,theta,phi);
scene.add(camera);

canvas.domElement.onmousedown = function(e){// Movimiento de la vista con el mouse
  isDragging = true;
  xDown = e.clientX;
  yDown = e.clientY;
};
canvas.domElement.onmouseup = function(){
  isDragging = false;
};
canvas.domElement.onmousemove = function(e){
    if (isDragging) {
        phi += ( e.clientX - xDown )/200;
        theta -= ( e.clientY - yDown )/200;
        xDown = e.clientX;
        yDown = e.clientY;
        camera.updatePosition(r,theta,phi);
    }
};
canvas.domElement.onwheel = function(e){
    r += 3*e.deltaY;
    camera.updatePosition(r,theta,phi);
};
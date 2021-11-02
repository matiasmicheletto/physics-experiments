function Dynamic(){ // Modela la dinamica del arreglo de pendulos
    this.N = 15; // Cantidad de pendulos
	this.d = 20 // Separacion etre pendulos
    this.xo = 10; // Condicion inicial
    this.h = 20; // Altura de las bolillas respecto del suelo
    this.t = 20; // Altura del soporte menor
	this.Gamma = 10; // Duracion del ciclo (s)
	this.osc = 20; // Oscilaciones del pendulo mayor
	
	this.g = 9.8;
	
	this.L = []; // Longitudes
	
	this.th = []; // Posiciones
	this.w = []; // Velocidades
	this.a = []; // Aceleraciones

	this.dt = 0.1;
	
    this.init = function(){
		for(var i = 0; i < this.N; i++){
			this.L[i] = 1000*this.g*this.Gamma*this.Gamma/4/Math.PI/Math.PI/(this.osc+i)/(this.osc+i);
			this.th[i] = Math.asin(this.xo/this.L[i]); // Angulos iniciales distintos
			this.w[i] = 0;
			this.a[i] = 0;
		};
    };

    this.step = function(){
		for(var i = 0; i < this.N; i++){
			this.a[i] = -this.g/this.L[i]*Math.sin(this.th[i]);
			this.w[i] += this.a[i]*this.dt;
			this.th[i] += this.w[i]*this.dt;
		}
    };
	
	this.getPosition = function(i){
		return {x:this.L[i]*Math.sin(this.th[i]),
				y:this.L[i]*(1-Math.cos(this.th[i]))+this.h,
				z:i*this.d};
	}
};

var dyn = new Dynamic();
dyn.init();
var running = false;

// SUELO
var floorGeom = new THREE.PlaneGeometry(500,500);
var floorTexture = THREE.ImageUtils.loadTexture("img/FloorTexture.jpg");
var floorMaterial = new THREE.MeshBasicMaterial({map:floorTexture, side:THREE.DoubleSide});
var floor = new THREE.Mesh(floorGeom, floorMaterial);
floor.rotation.x = -Math.PI/2;
floor.position.z = dyn.d*dyn.N/2;
scene.add(floor);

// PENDULOS
var ballMaterial = new THREE.MeshLambertMaterial({color: 0x6395AB});
var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
var holderMaterial = new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture("img/WoodTexture.jpg")});

var pendulums = [];
var lines = [];
var lineGeometries = [];
var holders = [];

for(var i = 0; i < dyn.N; i++){
	
    holders[i] = new THREE.Mesh(new THREE.CubeGeometry(dyn.d, dyn.t+dyn.L[0]-dyn.L[i], dyn.d), holderMaterial);
    holders[i].position = {x: 0, y: dyn.L[i]+dyn.h+(dyn.t+dyn.L[0]-dyn.L[i])/2, z: i*dyn.d};
	
    lineGeometries[i] = new THREE.Geometry();
    var pos = dyn.getPosition(i);
    lineGeometries[i].vertices.push( new THREE.Vector3( 0, dyn.h + dyn.L[i], dyn.d*(i-0.5) ) );
    lineGeometries[i].vertices.push( new THREE.Vector3( pos.x, pos.y, pos.z ) );
    lineGeometries[i].vertices.push( new THREE.Vector3( 0, dyn.h + dyn.L[i], dyn.d*(i+0.5) ) );
    lines[i] = new THREE.Line( lineGeometries[i], lineMaterial );
	
    pendulums[i] = new THREE.Mesh(new THREE.SphereGeometry(5,10,10),ballMaterial);
	pendulums[i].position = dyn.getPosition(i);
	
	scene.add(holders[i]);
    scene.add(lines[i]);
	scene.add(pendulums[i]);
}


function dyn2Three(){ // Actualizar posicion de los cuerpos
    for(var i = 0; i < dyn.N; i++){
        pendulums[i].position = lines[i].geometry.vertices[1] = dyn.getPosition(i);
        lines[i].geometry.verticesNeedUpdate = true;
    }
}


// LUCES ///
var light = new THREE.PointLight(0xffffff);
light.position.set(0, 300, 0);
scene.add(light);

var light2 = new THREE.PointLight(0xffffff);
light2.position.set(500, 20, 500);
scene.add(light2);

camera.center = {x:0,y:0,z:dyn.d*dyn.N/2};
r = 300;
camera.updatePosition(r,theta,phi);

// Animacion
function render(){
    canvas.render(scene, camera);
    if(running){
		dyn.step();
		dyn2Three();
	}
    requestAnimationFrame(render);
}

render();




// CONTROLES //
var gui = new dat.GUI();

var params = {
//	g: dyn.g,
//	xo: dyn.xo,
    play_pause: function(){running = !running;},
    reset: function(){dyn.init(); dyn2Three();}
};

//var g_slider = gui.add(params, 'g',1,20).name("Gravedad");
//var xo_slider = gui.add(params, 'xo',1,30).name("Posición inicial");
gui.add(params, 'play_pause').name("Play/Pause");
gui.add(params, 'reset').name("Reset");

//g_slider.onFinishChange(function(val){dyn.g = val});
//xo_slider.onFinishChange(function(val){dyn.xo = val});

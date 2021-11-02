function dynamic(){
    this.m1 = 81.3; // Masa de la Tierra
    this.x1 = [0,0,0]; // Posicion
	this.v1 = [0,0,0]; // Velocidad
	this.a1 = [0,0,0]; // Aceleracion
    this.xo1 = [0,0,0]; // Posicion inicial
	this.vo1 = [0,0,0]; // Velocidad inicial

    this.m2 = 1; 
	this.x2 = [0,0,0]; 
	this.v2 = [0,0,0]; 
	this.a2 = [0,0,0];
    this.xo2 = [0,0,7]; 
	this.vo2 = [3,0,0];

    this.G = 1; // Cte. gravitacional 
	this.r = 0; // Distancia entre la tierra y la luna
	
	this.crash = false; // Colision con la tierra

    this.dt = 0.005; // Paso diferencial de tiempo
    this.t = 0;

	// Arreglos para registros
	this.pos = [];

    this.init = function(){
			this.x1[0] = this.xo1[0]; this.x1[1] = this.xo1[1]; this.x1[2] = this.xo1[2];
			this.v1[0] = this.vo1[0]; this.v1[1] = this.vo1[1]; this.v1[2] = this.vo1[2];

			this.x2[0] = this.xo2[0]; this.x2[1] = this.xo2[1]; this.x2[2] = this.xo2[2];
			this.v2[0] = this.vo2[0]; this.v2[1] = this.vo2[1]; this.v2[2] = this.vo2[2];

			this.crash = false;

			this.t = 0;

			// Restablecer los arreglos de datos
			this.pos = [];
         },

    this.step = function(){
			this.r = Math.sqrt((this.x1[0]-this.x2[0]) * (this.x1[0]-this.x2[0]) +
			       (this.x1[1]-this.x2[1]) * (this.x1[1]-this.x2[1]) +
			       (this.x1[2]-this.x2[2]) * (this.x1[2]-this.x2[2]));

			if(this.r < 2.3){ // Colision con la tierra			
				this.crash = true; 
				return;
			}

			var K = -this.G*this.m2/this.r/this.r/this.r;

			this.a1[0] = K*(this.x1[0] - this.x2[0]);
			this.a1[1] = K*(this.x1[1] - this.x2[1]);
			this.a1[2] = K*(this.x1[2] - this.x2[2]);
			this.v1[0] += this.a1[0]*this.dt;
			this.v1[1] += this.a1[1]*this.dt;
			this.v1[2] += this.a1[2]*this.dt;
			this.x1[0] += this.v1[0]*this.dt;
			this.x1[1] += this.v1[1]*this.dt;
			this.x1[2] += this.v1[2]*this.dt;

			K *= this.m1/this.m2;

			this.a2[0] = K*(this.x2[0] - this.x1[0]);
			this.a2[1] = K*(this.x2[1] - this.x1[1]);
			this.a2[2] = K*(this.x2[2] - this.x1[2]);
			this.v2[0] += this.a2[0]*this.dt;
			this.v2[1] += this.a2[1]*this.dt;
			this.v2[2] += this.a2[2]*this.dt;
			this.x2[0] += this.v2[0]*this.dt;
			this.x2[1] += this.v2[1]*this.dt;
			this.x2[2] += this.v2[2]*this.dt; 

			this.t += this.dt;

			this.pos.push([this.t,this.r]);
         }
};

var dyn = new dynamic();
dyn.init();
var running = false;


// OBJETOS //
// Tierra
var earthGeometry = new THREE.SphereGeometry(100, 50, 50);
var earthTexture = THREE.ImageUtils.loadTexture("img/EarthTexture.jpg");
var earthMaterial = new THREE.MeshLambertMaterial({map:earthTexture});
var earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);
// Nubes sobre la tierra
var cloudsGeometry = new THREE.SphereGeometry(105, 60, 60);
var cloudsTexture = THREE.ImageUtils.loadTexture("img/CloudsTexture.jpg");
var cloudsMaterial = new THREE.MeshLambertMaterial({
    map:cloudsTexture,
    side: THREE.DoubleSide,
    opacity: 0.3,
    transparent: true,
    depthWrite: false
});
var clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
scene.add(clouds); 
// Luna
var moonGeometry = new THREE.SphereGeometry(30, 50, 50);
var moonTexture = THREE.ImageUtils.loadTexture("img/MoonTexture.jpg");
var moonMaterial = new THREE.MeshLambertMaterial({map:moonTexture});
var moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);
// Estrellas
var starsGeometry  = new THREE.SphereGeometry(1000, 20, 20)
var starsMaterial  = new THREE.MeshBasicMaterial()
starsMaterial.map   = THREE.ImageUtils.loadTexture('img/StarfieldTexture.jpg')
starsMaterial.side  = THREE.BackSide
var starsMesh  = new THREE.Mesh(starsGeometry, starsMaterial)
scene.add(starsMesh);

var dyn2Three = function(){
	// Escalar posiciones
	earth.position.x = dyn.x1[0]*50;
	earth.position.y = dyn.x1[1]*50;
	earth.position.z = dyn.x1[2]*50;
	earth.rotation.y += 0.001;
		
	clouds.position = earth.position;
	clouds.rotation.y += 0.002;
	
	moon.position.x = dyn.x2[0]*50;
	moon.position.y = dyn.x2[1]*50;
	moon.position.z = dyn.x2[2]*50;
	moon.rotation.y += 0.003;
}

// SOL // (Iluminacion de la escena)
var sun = new THREE.PointLight(0xffffff);
sun.position.set(500, 500, 500);
scene.add(sun);

function render(){
	canvas.render(scene, camera);
	if(running && !dyn.crash){
		dyn.step();
		dyn2Three();
		if(childWindow)
			if(!childWindow.closed)
				if(childWindow.Flotter)
					childWindow.Flotter.draw();
	}
	requestAnimationFrame(render);
}

r = 600; theta = Math.PI/2; phi = Math.PI/3;
camera.updatePosition(r,theta,phi);
dyn2Three();
render();


// CONTROLES //
var gui = new dat.GUI();

var params = {
    m1: dyn.m1,
	m2: dyn.m2,
	r: dyn.xo2[2]*50000,
	v: dyn.vo2[0],
	play_pause: function(){running = !running;},
	reset: function(){ // Reiniciar todo
		dyn.init(); 
		dyn2Three();
		if(childWindow) // Al borrar los datos es necesario reiniciar la grafica
			if(childWindow.Flotter)
				childWindow.updateData();
	},
	plot: function(){ // Mostrar grafico
		if(childWindow){ // Si se creo la ventana
			if(childWindow.closed) // Si esta cerrada, abrir
				openFlotter();
		}else // Crear por primera vez
			openFlotter();
	}
};

var m1_slider = gui.add(params, 'm1',1,100,0.1).name("Mass of earth");
var m2_slider = gui.add(params, 'm2',1,10).name("Mass of moon");
var r_slider = gui.add(params, 'r',150000,1000000,10000).name("Initial position");
var v_slider = gui.add(params, 'v',1,5).name("Inicial velocity");
gui.add(params, 'play_pause').name("Play/Pause");
gui.add(params, 'reset').name("Reset");
gui.add(params, 'plot').name("Plots");

m1_slider.onFinishChange(function(val){dyn.m1 = val;});
m2_slider.onFinishChange(function(val){dyn.m2 = val;});
r_slider.onFinishChange(function(val){dyn.xo2[2] = val/50000;})
v_slider.onFinishChange(function(val){dyn.vo2[0] = val;})

// GRAFICO //
var childWindow; // Objeto para manejar la ventana del grafico
var openFlotter = function(){ // Mostrar grafica
	childWindow = window.open("js/Flotter.html", "", "width=800, height=500");
	if(childWindow)
		childWindow.onload = function(){
			// Opciones de datos para graficar:
            childWindow.params = {
                r: true,
				play_pause: function(){running = !running;}
            };

            // Inicialmente se grafica la posicion
            childWindow.data = [{data:dyn.pos,label: "Position",vble: ["t = ","r = "],unit: ["s","m"]}];
            childWindow.Flotter.data = childWindow.data;
            childWindow.Flotter.draw();

            // Al cambiar opciones se actualizan los arreglos de datos
            childWindow.updateData = function(){
                childWindow.data = [];
                if(childWindow.params.r) childWindow.data.push({data:dyn.pos,label: "Position",vble: ["t = ","r = "],unit: ["s","m"]});
                childWindow.Flotter.clear();
                childWindow.Flotter.data = childWindow.data;
                childWindow.Flotter.draw();
            };

            childWindow.gui.add(childWindow.params, 'r' ).name("Position").onChange(childWindow.updateData);
            childWindow.gui.add(params, 'play_pause').name("Play/Pause");
        };
	window.onclose = function(){
		childWindow.close();
	}
};
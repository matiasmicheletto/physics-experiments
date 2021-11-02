function dynamic(){ // Modela el sistema de masa resorte
    // Parametros del sistema
    this.m = 5; // Masa del cuerpo
    this.g = 9.8; // Gravedad
    this.R = 20; // Radio de la rampa
    this.BC = 20; // Longitud de la zona rugosa
    this.b = 0.5; // Rozamiento de la zona rugosa
    this.L = 15; // Longitud natural del resorte
    this.k = 10; // Constante del resorte
    this.xD = this.R+this.BC+30; // Resorte (El suelo liso tiene 30 de long.)
    this.stage = 0; // Etapa de la trayectoria

    this.dt = 0.05; // Paso diferencial de tiempo

    // Variables de estado
    this.x = [0,0]; // Posicion
    this.v = 0; // Velocidad
    this.a = 0; // Aceleracion
    this.t = 0; // Tiempo

	// Arreglos para registros
	this.pos = [];
	this.vel = [];
	this.ace = [];
	
    this.init = function(){
        // Instante inicial de tiempo se inicia en 0
        this.t = 0;

        this.x[0] = 0;
    	this.x[1] = this.R - Math.sqrt(2*this.x[0]*this.R - this.x[0]*this.x[0]);

    	this.stage = 0;
    	this.a = 0;
    	this.v = 0;
		
		// Restablecer los arreglos de datos
		this.pos = [];
		this.vel = [];
		this.ace = [];
    };

    this.step = function(){

    	if(this.x[0] >= 0 && this.x[0] <= this.R)
    		this.stage = 0;
    	else
    		if(this.x[0] > this.R && this.x[0] <= this.R + this.BC)
    			this.stage = 1;
    		else
    			if(this.x[0] > this.R + this.BC && this.x[0] <= this.xD)
    				this.stage = 2;
    			else
    				if(this.x[0] > this.xD){
	    				this.stage = 3;
	    				if(this.x[0] > this.xD + this.L - 3)
	    					this.v *= -1; // Maxima compresion del resorte
	    			}
	    			else
	    				this.stage = 4;

    	// La aceleracion depende de donde se encuentre el cuerpo
    	switch(this.stage){
    		case 0: // Rampa
    			this.a = this.g - this.g/this.R*this.x[0];
    			break;
    		case 1: // Superficie rugosa
    			this.a = -this.b*this.v/this.m;
    			break;
    		case 2: // Zona sin rozamiento
    			this.a = 0;
    			break;
    		case 3: // Resorte
    			this.a = -this.k*(this.x[0] - this.xD)/this.m;
    			break;
    		default:
    			this.init();
    			return;
    			break;
    	}

    	this.v += this.a*this.dt; // Velocidad del cuerpo
    	this.x[0] += this.v*this.dt; // Posicion horizontal
    	this.x[1] = this.stage === 0 ? this.R - Math.sqrt(2*this.x[0]*this.R - this.x[0]*this.x[0]) : 0;

    	this.t += this.dt;

		this.pos.push([this.t,this.x[0]]);
		this.vel.push([this.t,this.v]);
		this.ace.push([this.t,this.a]);
    }
};

var dyn = new dynamic();
dyn.init();
var running = false; // Animacion corriendo

// PARED
var wall = new THREE.Mesh(new THREE.PlaneGeometry(200,300), 
		new THREE.MeshBasicMaterial({
			map:THREE.ImageUtils.loadTexture("img/WallTexture.png"), 
			side:THREE.DoubleSide}));
wall.position.x = (dyn.xD+dyn.L)*10;
wall.position.y = 150;
wall.rotation.y = Math.PI/2;
scene.add(wall);

// SUELO LISO //
var floorMaterial = new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture("img/FloorTexture.jpg"),side:THREE.DoubleSide});
var floor = new THREE.Mesh(new THREE.PlaneGeometry(300+dyn.L*10,200), floorMaterial);
floor.rotation.x = -Math.PI/2;
floor.position.x = (dyn.R+dyn.BC)*10+(300+dyn.L*10)/2;
scene.add(floor);

// SECCION ASPERA //
var roughFloor = new THREE.Mesh(new THREE.PlaneGeometry(dyn.BC*10,200),
	new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture("img/FloorTexture1.jpg"),side:THREE.DoubleSide}));
roughFloor.rotation.x = -Math.PI/2;
roughFloor.position.x = (dyn.R+dyn.BC/2)*10;
scene.add(roughFloor);

// RAMPA //
var rampGeometry = new THREE.CylinderGeometry(dyn.R*10, dyn.R*10, 200, 32, 1, 3*Math.PI/2, Math.PI/2);
var ramp = new THREE.Mesh(rampGeometry,floorMaterial);
ramp.rotation.x = Math.PI/2;
ramp.position = {x:dyn.R*10, y:dyn.R*10, z:0};
ramp.setR = function(R){ // Cambiar la geometria de la rampa
	var inc = R - dyn.R*10;
	for(var i = 0; i < 33; i++){
		// Desplazo en x y en z, porque esta rotado (es como desplazar en y)
		ramp.geometry.vertices[i].x -= inc*Math.sin(Math.PI/64*(32-i));
		ramp.geometry.vertices[i].z += inc*Math.cos(Math.PI/64*(32-i));
		ramp.geometry.vertices[i+33].x -= inc*Math.sin(Math.PI/64*(32-i));
		ramp.geometry.vertices[i+33].z += inc*Math.cos(Math.PI/64*(32-i));
	}
	ramp.position.y += inc;
	ramp.geometry.verticesNeedUpdate = true;
};
scene.add(ramp);

// RESORTE
var N = 10; // Vueltas
var R = 10; // Radio
Curve = new THREE.Curve.create(
    function ( scale ) {
        this.scale = (scale === undefined) ? 1 : scale;
    },
    
    function ( t ) {
        var tx = dyn.L*10*t,
            ty = R*Math.cos(2*N*Math.PI*t),
            tz = -R*Math.sin(2*N*Math.PI*t);
        
        return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
    }
);		
var path = new Curve();
var spring = new THREE.Mesh(new THREE.TubeGeometry(path,200,2,8,false), new THREE.MeshLambertMaterial({color:0x757575}));
spring.position.y = 15;
spring.position.x = (dyn.xD+dyn.L)*10;
spring.rotation.y = Math.PI;
spring.actualLenght = dyn.L*10; // Atributo definido ahora
spring.setLenght = function(l){ // Metodo definido ahora
	// Se desplazan todos los vertices en la direccion x
	// A l le resto 30 para que comprima contra la caja que mide 30
	var inc = (l-this.actualLenght-30)/200; // Desplazamiento
	this.actualLenght = l-30;
	var d = 0;
	for(var i = 0; i < 201; i++, d += inc)
		for(var j = 0; j < 8; j++)
			spring.geometry.vertices[8*i+j].x += d;
	spring.geometry.verticesNeedUpdate = true;
}
spring.setLenght(dyn.L*10);
scene.add(spring);

// CAJA //
var box = new THREE.Mesh(new THREE.CubeGeometry(30,30,30),
		new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture("img/WoodTexture.jpg")}));
box.position = {x:15, y:15, z:0};
scene.add(box);

// LUCES //
var light = new THREE.PointLight(0xffffff);
light.position.set(0, 300, 0);
scene.add(light);

var light2 = new THREE.PointLight(0xffffff);
light2.position.set(500, 20, 500);
scene.add(light2);

// CAMARA //
camera.center.x = floor.position.x;
r = 900;
camera.updatePosition(r,theta,phi);


function dyn2Three(){ // Actualizar posicion de los cuerpos
    box.position.x = dyn.x[0]*10 + 15;
    box.position.y = dyn.x[1]*10 + 15;
    if(dyn.stage === 3)
    	spring.setLenght((dyn.L-dyn.x[0]+dyn.xD)*10);
    if(dyn.x[0] < dyn.R)
    	box.rotation.z = -Math.asin((dyn.R-dyn.x[0])/dyn.R);
    if(dyn.x[0] > dyn.R && dyn.x[0] <= dyn.R+1) // Apenas sale de la rampa
    	box.rotation.z = 0;
};

// Animacion
var render = function(){
    canvas.render(scene, camera);
	if(running){
		dyn.step();
		dyn2Three();
		if(childWindow)
			if(!childWindow.closed)
				if(childWindow.Flotter)
					childWindow.Flotter.draw();
	}
    requestAnimationFrame(render);
};

render();
dyn2Three();


// CONTROLES //
var gui = new dat.GUI({width: 300});

var params = {
    m: dyn.m,
    g: dyn.g,
    R: dyn.R,
    BC: dyn.BC,
    b: dyn.b,
    L: dyn.L,
    k: dyn.k,

	play_pause: function(){running = !running;},
	
	reset: function(){ // Reiniciar todo
		dyn.init(); 
		box.rotation.z = 0;
		spring.setLenght(dyn.L*10);
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

var m_slider = gui.add(params, 'm',1,10,0.1).name("Mass");
var g_slider = gui.add(params, 'g',0,20,0.1).name("Gravty");
var R_slider = gui.add(params, 'R',10,30,1).name("Ramp radius");
var BC_slider = gui.add(params, 'BC',10,30,1).name("Friction zone length");
var b_slider = gui.add(params, 'b',0.1,5,0.1).name("Friction");
var L_slider = gui.add(params, 'L',10,25,0.1).name("Spring length");
var k_slider = gui.add(params, 'k',1,20,0.1).name("Spring constant");
gui.add(params, 'play_pause').name("Play/Pause");
gui.add(params, 'reset').name("Reset");
gui.add(params, 'plot').name("Plots");

m_slider.onFinishChange(function(val){dyn.m = val;});
g_slider.onFinishChange(function(val){dyn.g = val;});
R_slider.onFinishChange(function(val){
	ramp.setR(val*10);
	ramp.position.x += (val-dyn.R)*10;
	roughFloor.position.x += (val-dyn.R)*10;
	floor.position.x += (val-dyn.R)*10;
	wall.position.x += (val-dyn.R)*10;
	spring.position.x += (val-dyn.R)*10;
	dyn.xD += val-dyn.R;
	dyn.R = val;
	dyn.init();
	dyn2Three();
	if(childWindow)
		if(childWindow.Flotter)
			childWindow.updateData();
});
BC_slider.onFinishChange(function(val){
	floor.geometry.vertices[0].x = floor.geometry.vertices[2].x += (val-dyn.BC)*10;
	floor.geometry.verticesNeedUpdate = true;
	roughFloor.geometry.vertices[1].x = roughFloor.geometry.vertices[3].x += (val-dyn.BC)*10;
	roughFloor.geometry.verticesNeedUpdate = true;
	dyn.BC = val;
	dyn.init();
	dyn2Three();
	if(childWindow)
		if(childWindow.Flotter)
			childWindow.updateData();
})
b_slider.onFinishChange(function(val){dyn.b = val;});
L_slider.onFinishChange(function(val){
	wall.position.x = spring.position.x += (val-dyn.L)*10;
	spring.setLenght(val*10);
	floor.geometry.vertices[1].x = floor.geometry.vertices[3].x += (val-dyn.L)*10;
	floor.geometry.verticesNeedUpdate = true;
	dyn.L = val;
	dyn.init();
	dyn2Three();
	if(childWindow)
		if(childWindow.Flotter)
			childWindow.updateData();
});
k_slider.onFinishChange(function(val){dyn.k = val;});

// GRAFICO //
var childWindow; // Objeto para manejar la ventana del grafico
var openFlotter = function(){ // Mostrar grafica
	childWindow = window.open("js/Flotter.html", "", "width=800, height=500");
	if(childWindow)
		childWindow.onload = function(){
			// Opciones de datos para graficar:
			childWindow.params = {
				pos: true,
				vel: false,
				ace: false,
				play_pause: function(){running = !running;}
			};

			// Inicialmente se grafica la posicion
			childWindow.data = [{data:dyn.pos,label: "Position",vble: ["t = ","x = "],unit: ["s","m"]}];
			childWindow.Flotter.data = childWindow.data;
			childWindow.Flotter.draw();

			// Al cambiar opciones se actualizan los arreglos de datos
			childWindow.updateData = function(){
				childWindow.data = [];
				if(childWindow.params.pos) childWindow.data.push({data:dyn.pos,label: "Position",vble: ["t = ","x = "],unit: ["s","m"]});
				if(childWindow.params.vel) childWindow.data.push({data:dyn.vel,label: "Velocity",vble: ["t = ","v = "],unit: ["s","m/s"]});
				if(childWindow.params.ace) childWindow.data.push({data:dyn.ace,label: "Acceleration",vble: ["t = ","a = "],unit: ["s","m/s²"]});
				childWindow.Flotter.clear();
				childWindow.Flotter.data = childWindow.data;
				childWindow.Flotter.draw();
			};

			childWindow.gui.add(childWindow.params, 'pos' ).name("Position").onChange(childWindow.updateData);
			childWindow.gui.add(childWindow.params, 'vel' ).name("Velocity").onChange(childWindow.updateData);
			childWindow.gui.add(childWindow.params, 'ace' ).name("Acceleration").onChange(childWindow.updateData);			
			childWindow.gui.add(params, 'play_pause').name("Play/Pause");
		};
	window.onclose = function(){
		childWindow.close();
	}
};

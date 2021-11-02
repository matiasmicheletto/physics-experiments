function dynamic(){ // Modela el sistema de masa resorte
    // Parametros del sistema
    this.m = 3; // Masa
    this.k = 5; // Cte. elastica
    this.b = 0; // Rozamiento
    this.F = 0; // Fza externa
    this.w = 0; // Frec. fza externa
    this.xo = 5; // Posicion inicial
    this.vo = 0; // Velocidad inicial

    this.dt = 0.05; // Paso diferencial de tiempo

    // Variables de estado
    this.x = 0; // Posicion
    this.v = 0; // Velocidad
    this.a = 0; // Aceleracion
    this.t = 0; // Tiempo

    // Arreglos para registros
	this.pos = [];
	this.vel = [];
	this.ace = [];
	
    this.init = function(){
        // Establecer condiciones iniciales de posicion y velocidad
        this.x = this.xo;
        this.v = this.vo;
        // El valor de la aceleracion se asigna al inicio para que
        // los vectores se grafiquen correctamente
        this.a = -this.k / this.m * this.xo;
		this.a -= this.b / this.m * this.v;
		this.a += this.F / this.m * Math.cos(this.w * this.t);
        // Instante inicial de tiempo se inicia en 0
        this.t = 0;
		
		// Restablecer los arreglos de datos
		this.pos = [];
		this.vel = [];
		this.ace = [];
    };

    this.step = function(){
        // Calculo de las variables dinamicas
        this.v += this.a * this.dt; // Actualizar velocidad
        this.x += this.v * this.dt; // Actualizar posicion
		this.a = -this.k / this.m * this.x; // Actualizar aceleracion
        if( this.b ) // Para evitar la siguiente cuenta
            this.a -= this.b / this.m * this.v; // Termino lineal
        if( this.F ) // Para evitar la siguiente cuenta
            this.a += this.F / this.m * Math.cos(this.w * this.t); // Termino de fuerza cosenoidal externa

        this.t += this.dt;
		
		this.pos.push([this.t,this.x]);
		this.vel.push([this.t,this.v]);
		this.ace.push([this.t,this.a]);
    }
};

var dyn = new dynamic();
dyn.init();
var running = false; // Animacion corriendo

// SUELO //
var floor = new THREE.Mesh(new THREE.PlaneGeometry(500,500), 
		new THREE.MeshBasicMaterial({
			map:THREE.ImageUtils.loadTexture("img/FloorTexture.jpg"), 
			side:THREE.DoubleSide}));
floor.rotation.x = -Math.PI/2;
scene.add(floor);

// CAJA //
var box = new THREE.Mesh(new THREE.CubeGeometry(30,30,30),
		new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture("img/WoodTexture.jpg")}));
box.position = {x:dyn.x*10, y:15, z:0};
scene.add(box);

// RESORTE
var L = 80; // Longitud natural
var N = 8; // Vueltas
var R = 10; // Radio
Curve = new THREE.Curve.create(
    function ( scale ) {
        this.scale = (scale === undefined) ? 1 : scale;
    },
    
    function ( t ) {
        var tx = L*t,
            ty = R*Math.cos(2*N*Math.PI*t),
            tz = -R*Math.sin(2*N*Math.PI*t);
        
        return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
    }
);		
var path = new Curve();
var spring = new THREE.Mesh(new THREE.TubeGeometry(path,200,2,8,false), new THREE.MeshLambertMaterial({color:0x757575}));
spring.position.y = 15;
spring.position.x = -L-15;
spring.actualLenght = L; // Atributo definido ahora
spring.setLenght = function(l){ // Metodo definido ahora
	// Se desplazan todos los vertices en la direccion x
	var inc = (l-this.actualLenght)/200; // Desplazamiento
	this.actualLenght = l;
	var d = 0;
	for(var i = 0; i < 201; i++, d += inc)
		for(var j = 0; j < 8; j++)
			spring.geometry.vertices[8*i+j].x += d;
	spring.geometry.verticesNeedUpdate = true;
}
spring.setLenght(L+dyn.x*10);
scene.add(spring);

// PARED
var wall = new THREE.Mesh(new THREE.PlaneGeometry(500,500), 
		new THREE.MeshBasicMaterial({
			map:THREE.ImageUtils.loadTexture("img/WallTexture.png"), 
			side:THREE.DoubleSide}));
wall.position.x = -L-15;
floor.position.x = -L-15+250;
wall.position.y = 250;
wall.rotation.y = Math.PI/2;
scene.add(wall);

// LUCES //
var light = new THREE.PointLight(0xffffff);
light.position.set(0, 300, 0);
scene.add(light);

var light2 = new THREE.PointLight(0xffffff);
light2.position.set(500, 20, 500);
scene.add(light2);


function dyn2Three(){ // Actualizar posicion de los cuerpos
	spring.setLenght(L+dyn.x*10);
    box.position.x = lastX = dyn.x*10;
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


// CONTROLES //
var gui = new dat.GUI({width: 300});

var params = {
    m: dyn.m,
	b: dyn.b,
	k: dyn.k,
	xo: dyn.xo,
	vo: dyn.vo,
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

var m_slider = gui.add(params, 'm',1,10,0.1).name("Mass");
var b_slider = gui.add(params, 'b',0,5).name("Friction");
var k_slider = gui.add(params, 'k',0,10).name("Spring constant");
var xo_slider = gui.add(params, 'xo',-10,10).name("Initial position");
var vo_slider = gui.add(params, 'vo',-10,10).name("Initial speed");
gui.add(params, 'play_pause').name("Play/Pause");
gui.add(params, 'reset').name("Reset");
gui.add(params, 'plot').name("Plots");

m_slider.onFinishChange(function(val){dyn.m = val;});
b_slider.onFinishChange(function(val){dyn.b = val;});
k_slider.onFinishChange(function(val){dyn.k = val;});
xo_slider.onFinishChange(function(val){dyn.xo = val;});
vo_slider.onFinishChange(function(val){dyn.vo = val;});

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

function dynamic(){ // Modela el sistema de masa resorte
    // Parametros del sistema
    this.m = 3; // Masa
    this.k = 5; // Cte. elastica
    this.b = 0; // Rozamiento
    this.F = 0; // Fza externa
    this.w = 0; // Frec. fza externa
    this.xo = [5,0]; // Posicion inicial
    this.vo = [0,0]; // Velocidad inicial

    this.dt = 0.05; // Paso diferencial de tiempo

    // Variables de estado
    this.x = [0,0]; // Posicion
    this.v = [0,0]; // Velocidad
    this.a = [0,0]; // Aceleracion
    this.t = 0; // Tiempo

    this.init = function(){
        // Establecer condiciones iniciales de posicion y velocidad
        this.x[0] = this.xo[0]; this.x[1] = this.xo[1];
        this.v[0] = this.vo[0]; this.v[1] = this.vo[1];
        // El valor de la aceleracion se asigna al inicio para que
        // los vectores se grafiquen correctamente
        this.a[0] = -this.k / this.m * this.xo[0];
		this.a[0] -= this.b / this.m * this.v[0];
		this.a[0] += this.F / this.m * Math.cos(this.w * this.t);
        // Instante inicial de tiempo se inicia en 0
        this.t = 0;
    };

    this.step = function(){
        // Calculo de las variables dinamicas        
        this.v[0] += this.a[0] * this.dt; // Actualizar velocidad
        this.x[0] += this.v[0] * this.dt; // Actualizar posicion
		this.a[0] = -this.k / this.m * this.x[0]; // Actualizar aceleracion
        if( this.b ) // Para evitar la siguiente cuenta
            this.a[0] -= this.b / this.m * this.v[0]; // Termino lineal
        if( this.F ) // Para evitar la siguiente cuenta
            this.a[0] += this.F / this.m * Math.cos(this.w * this.t); // Termino de fuerza cosenoidal externa

        this.t += this.dt;
    }
};

var dyn = new dynamic();
dyn.init();
var running = false;

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
box.position = {x:dyn.x[0]*10, y:15, z:0};
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
spring.setLenght(L+dyn.x[0]*10);
scene.add(spring);

// PARED
var wall = new THREE.Mesh(new THREE.PlaneGeometry(500,500), 
		new THREE.MeshBasicMaterial({
			map:THREE.ImageUtils.loadTexture("img/WallTexture.png"), 
			side:THREE.DoubleSide}));
wall.position.x = -L-15;
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


function body2Three(){ // Actualizar posicion de los cuerpos
	spring.setLenght(L+dyn.x[0]*10);
    box.position.x = lastX = dyn.x[0]*10;
};



// Animacion
var render = function(){
    canvas.render(scene, camera);
	if(running){
		dyn.step();
		body2Three();
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
	xo: dyn.xo[0],
	vo: dyn.vo[0],
	play_pause: function(){running = !running},
	reset: function(){dyn.init(); body2Three()}
};

var m_slider = gui.add(params, 'm',1,10,0.1).name("Masa");
var b_slider = gui.add(params, 'b',0,5).name("Rozamiento");
var k_slider = gui.add(params, 'k',0,10).name("Cte. elástica");
var xo_slider = gui.add(params, 'xo',-10,10).name("Posición inicial");
var vo_slider = gui.add(params, 'vo',-10,10).name("Velocidad inicial");
gui.add(params, 'play_pause').name("Play/Pause");
gui.add(params, 'reset').name("Reset");

m_slider.onFinishChange(function(val){dyn.m = val;});
b_slider.onFinishChange(function(val){dyn.b = val;});
k_slider.onFinishChange(function(val){dyn.k = val;});
xo_slider.onFinishChange(function(val){dyn.xo[0] = val;});
vo_slider.onFinishChange(function(val){dyn.vo[0] = val;});

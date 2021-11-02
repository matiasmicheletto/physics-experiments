function dynamic(){ // Modela la dinamica del Ej 25 de la guia de energia
    //	Consiste en un cuerpo que gira libremente alrededor de un orificio de la mesa a traves del cual
    //  pasa la cuerda que une este cuerpo con otro colgante
    // Parametros del sistema
    this.m1 = 3; // Masa de los cuerpos
	this.m2 = 3;
    this.b = 0; // Rosamiento de la superfice
    this.ro = 0.7; // Distancia inicial
    this.wo = 3.74; // Velocidad inicial ( para ar=0 -> w = sqrt(m2*g/m1/r) )
    this.g = 9.8; // Aceleracion de la gravedad

    this.dt = 0.01; // Paso diferencial de tiempo

    // Variables de estado
    this.th = 0; // Angulo
    this.r = 0; // Radio (altura de la masa 2)
    this.w = 0; // Velocidad angular
    this.vr = 0; // Velocidad radial

    this.t = 0; // Tiempo

    // Arreglos para registros
    this.vel = [];
    this.h = [];

    this.init = function(){
        // Establecer condiciones iniciales de posicion y velocidad
        this.th = 0;
        this.r = this.ro;
        this.w = this.wo;
        this.vr = 0;

        // Instante inicial de tiempo se inicia en 0
        this.t = 0;

        // Restablecer los arreglos de datos
        this.vel = [];
        this.h = [];
    };

    this.step = function(){
        // Calculo de las variables dinamicas
        var ar = this.r*this.w*this.w - this.m2/this.m1*this.g;
        var at = -2*this.vr*this.w/this.r;

        this.vr += ar*this.dt;
        //this.w += at*this.dt;
        // Integrador rk4!
        var rh = this.vr*this.dt/this.r;
        this.w += -rh*this.w/3*(6 + 6*rh - 4*rh*rh + 2*rh*rh*rh);

        this.r += this.vr*this.dt;
        this.th += this.w*this.dt;

        if( this.r > 0.9 ){
            this.vr = -this.vr;
            this.r = 0.9;
        }

        if( this.r < 0.1 ){
            this.vr = -this.vr;
            this.r = 0.1;
        }

        this.t += this.dt;

        this.vel.push([this.t,this.w]);
        this.h.push([this.t,this.r]);
    }
};

var dyn = new dynamic();
dyn.init();
var running = false;


/// Objetos de la escena ///
// MESA
var tableFootGeom = new THREE.CubeGeometry(10,100,10);
var tableTopGeom = new THREE.CubeGeometry(220,10,220);
var floorGeom = new THREE.PlaneGeometry(1000,1000);
var woodTexture = THREE.ImageUtils.loadTexture("img/WoodTexture.jpg");
var floorTexture = THREE.ImageUtils.loadTexture("img/FloorTexture.jpg");
var mesh = new THREE.MeshBasicMaterial({map:woodTexture});
var floorMaterial = new THREE.MeshBasicMaterial({map:floorTexture});

var tableFoot1 = new THREE.Mesh(tableFootGeom, mesh);
var tableFoot2 = new THREE.Mesh(tableFootGeom, mesh);
var tableFoot3 = new THREE.Mesh(tableFootGeom, mesh);
var tableFoot4 = new THREE.Mesh(tableFootGeom, mesh);
var tableTop = new THREE.Mesh(tableTopGeom, mesh);
var floor = new THREE.Mesh(floorGeom, floorMaterial);

tableFoot1.position = {x:-100, y:50, z:-100};
tableFoot2.position = {x:100, y:50, z:-100};
tableFoot3.position = {x:100, y:50, z:100};
tableFoot4.position = {x:-100, y:50, z:100};
tableTop.position = {x:0, y:100, z:0};
floor.rotation.x = -Math.PI/2;

scene.add(tableFoot1);
scene.add(tableFoot2);
scene.add(tableFoot3);
scene.add(tableFoot4);
scene.add(tableTop);
scene.add(floor);

// PELOTA
var ballGeometry = new THREE.SphereGeometry(8,20,20);
var ballMaterial = new THREE.MeshLambertMaterial({color: 0xB5E1FB});
var ball = new THREE.Mesh(ballGeometry,ballMaterial);
ball.position = {x:100*dyn.r*Math.cos(dyn.th), y:113, z:100*dyn.r*Math.sin(dyn.th)};
scene.add(ball);

// CUERDA
var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
var lineGeometry = new THREE.Geometry();
lineGeometry.vertices.push( new THREE.Vector3( 100*dyn.r*Math.cos(dyn.th), 113, 100*dyn.r*Math.sin(dyn.th)),
                           new THREE.Vector3( 0, 105, 0 ),
                           new THREE.Vector3( 0, dyn.r*100, 0 ) );
var line = new THREE.Line( lineGeometry, lineMaterial );
scene.add( line );

// CAJA
var boxGeometry = new THREE.CubeGeometry(20,20,20);
var boxMaterial = new THREE.MeshLambertMaterial({color: 0x1A445C});
var box = new THREE.Mesh(boxGeometry,boxMaterial);
box.position = {x:0, y:dyn.r*100, z:0};
scene.add(box);


function dyn2Three(){ // Actualizar posicion de los cuerpos
    lineGeometry.vertices[0].x = 100*dyn.r*Math.cos(dyn.th);
    lineGeometry.vertices[0].z = 100*dyn.r*Math.sin(dyn.th);
    lineGeometry.vertices[2].y = 100*dyn.r;

    ball.position.x = 100*dyn.r*Math.cos(dyn.th);
    ball.position.z = 100*dyn.r*Math.sin(dyn.th);

    box.position.y = 100*dyn.r;

    lineGeometry.verticesNeedUpdate = true;
}


// LUCES ///
var light = new THREE.PointLight(0xffffff);
light.position.set(0, 300, 0);
scene.add(light);

var light2 = new THREE.PointLight(0xffffff);
light2.position.set(500, 20, 500);
scene.add(light2);


// Animacion
function render(){
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
}

render();




// CONTROLES //
var gui = new dat.GUI();

var params = {
    m1: dyn.m1,
	m2: dyn.m2,
	b: dyn.b,
	ro: dyn.ro,
	wo: dyn.wo,
	g: dyn.g,
	play_pause: function(){running = !running},
    
    reset: function(){ // Reiniciar animacion
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

var m1_slider = gui.add(params, 'm1',1,10,0.1).name("Ball mass");
var m2_slider = gui.add(params, 'm2',1,10).name("Box mass");
var b_slider = gui.add(params, 'b',0,5).name("Friction");
var ro_slider = gui.add(params, 'ro',0.1,1).name("Initial position");
var wo_slider = gui.add(params, 'wo',0,10).name("Initial speed");
var g_slider = gui.add(params, 'g',1,20).name("Gravity");
gui.add(params, 'play_pause').name("Play/Pause");
gui.add(params, 'reset').name("Reset");
gui.add(params, 'plot').name("Plots");

m1_slider.onFinishChange(function(val){dyn.m1 = val;});
m2_slider.onFinishChange(function(val){dyn.m2 = val;});
b_slider.onFinishChange(function(val){dyn.b = val;});
ro_slider.onFinishChange(function(val){dyn.ro = val;});
wo_slider.onFinishChange(function(val){dyn.wo = val;});
g_slider.onFinishChange(function(val){dyn.g = val;});

// GRAFICO //
var childWindow; // Objeto para manejar la ventana del grafico
var openFlotter = function(){ // Mostrar grafica
    childWindow = window.open("js/Flotter.html", "", "width=800, height=500");
    if(childWindow)
        childWindow.onload = function(){
            // Opciones de datos para graficar:
            childWindow.params = {
                h: true,
                vel: false,
                play_pause: function(){running = !running;}
            };

            // Inicialmente se grafica la posicion
            childWindow.data = [{data:dyn.h,label: "Position",vble: ["t = ","x = "],unit: ["s","m"]}];
            childWindow.Flotter.data = childWindow.data;
            childWindow.Flotter.draw();

            // Al cambiar opciones se actualizan los arreglos de datos
            childWindow.updateData = function(){
                childWindow.data = [];
                if(childWindow.params.h) childWindow.data.push({data:dyn.h,label: "Position",vble: ["t = ","x = "],unit: ["s","m"]});
                if(childWindow.params.vel) childWindow.data.push({data:dyn.vel,label: "Velocity",vble: ["t = ","w = "],unit: ["s","m/s"]});
                childWindow.Flotter.clear();
                childWindow.Flotter.data = childWindow.data;
                childWindow.Flotter.draw();
            };

            childWindow.gui.add(childWindow.params, 'h' ).name("Position").onChange(childWindow.updateData);
            childWindow.gui.add(childWindow.params, 'vel' ).name("Velocity").onChange(childWindow.updateData);
            childWindow.gui.add(params, 'play_pause').name("Play/Pause");
        };
    window.onclose = function(){
        childWindow.close();
    }
};
function dynamic(){ 
	this.m1 = 2; // Masa de la caja 1
	this.m2 = 3; // Masa de la caja 2
	this.m3 = 5; // Masa del plano inclinado

	this.b1 = 0; // Rozamiento entre el plano y la caja 1
	this.b2 = 0; // Rozamiento entre el plano y la caja 2
	this.b3 = 0; // Rozamiento entre el suelo y el plano

    this.g = 9.8; // Aceleracion de la gravedad
	
    this.L = 10; // Longitud de la cuerda

	// Dimensiones del plano
	this.alpha = Math.PI/6; // Angulo de inclinacion
	this.beta = Math.PI/4; // Angulo de inclinacion
	this.cos_a = Math.cos(this.alpha);
	this.sin_a = Math.sin(this.alpha);
	this.cos_b = Math.cos(this.beta);
	this.sin_b = Math.sin(this.beta);
	this.H = 200; // Altura del plano
	this.W = 100; // Ancho del plano

	this.x1 = 30; // Posicion de la caja 1
	this.x2 = -50; // Posicion de la caja 2
	this.x3 = 0; // Posicion del plano

    this.dt = 0.01; // Paso diferencial de tiempo

    this.t = 0; // Tiempo
	
	this.setAlpha = function(alpha){
		this.alpha = alpha;
		this.cos_a = Math.cos(this.alpha);
		this.sin_a = Math.sin(this.alpha);
	};
	
	this.setBeta = function(beta){
		this.beta = beta;
		this.cos_b = Math.cos(this.beta);
		this.sin_b = Math.sin(this.beta);
	};
	
	this.setHeight = function(h){
		this.H = h;
	};

    this.init = function(){
		this.x1 = 30; // Posicion de la caja 1
		this.x2 = -50; // Posicion de la caja 2
		this.x3 = 0; // Posicion del plano
    };

    this.step = function(){
    	this.x1 += 2*this.dt;
    	this.x2 -= 2*this.dt;
    	this.x3 += this.dt;
    }
};

var dyn = new dynamic();
dyn.init();
var running = false;

// SUELO //
var floorGeom = new THREE.PlaneGeometry(1000,1000);
var floorTexture = THREE.ImageUtils.loadTexture("img/FloorTexture.jpg");
var floorMaterial = new THREE.MeshBasicMaterial({map:floorTexture, side:THREE.DoubleSide});
var floor = new THREE.Mesh(floorGeom, floorMaterial);
floor.rotation.x = -Math.PI/2;
scene.add(floor);


// PLANO INCLINADO //
// Textura del plano
var planeTexture = THREE.ImageUtils.loadTexture("img/FloorTexture1.jpg");
var planeMaterial = new THREE.MeshBasicMaterial({map:planeTexture});
// Plano 1
var plane1Geom = new THREE.Geometry();
plane1Geom.vertices.push(new THREE.Vector3(dyn.H*dyn.cos_a/dyn.sin_a, 0, dyn.W/2));
plane1Geom.vertices.push(new THREE.Vector3(dyn.H*dyn.cos_a/dyn.sin_a, 0, -dyn.W/2));
plane1Geom.vertices.push(new THREE.Vector3(0, dyn.H, dyn.W/2));
plane1Geom.vertices.push(new THREE.Vector3(0, dyn.H, -dyn.W/2));
plane1Geom.faces.push( new THREE.Face4( 0, 1, 3, 2 ) );
plane1Geom.faceVertexUvs[0].push([
  new THREE.UV(1, 0),
  new THREE.UV(0, 0),
  new THREE.UV(0, 1),
  new THREE.UV(1, 1)
]);
plane1Geom.computeFaceNormals();
var plane1 = new THREE.Mesh(plane1Geom, planeMaterial);
// Plano 2
var plane2Geom = new THREE.Geometry(); 
plane2Geom.vertices.push(new THREE.Vector3(-dyn.H*dyn.cos_b/dyn.sin_b, 0, dyn.W/2));
plane2Geom.vertices.push(new THREE.Vector3(-dyn.H*dyn.cos_b/dyn.sin_b, 0, -dyn.W/2));
plane2Geom.vertices.push(new THREE.Vector3(0, dyn.H, dyn.W/2));
plane2Geom.vertices.push(new THREE.Vector3(0, dyn.H, -dyn.W/2));
plane2Geom.faces.push( new THREE.Face4( 0, 2, 3, 1) );
plane2Geom.faceVertexUvs[0].push([
  new THREE.UV(0, 0),
  new THREE.UV(0, 1),
  new THREE.UV(1, 1),
  new THREE.UV(1, 0)
]);
plane2Geom.computeFaceNormals();
var plane2 = new THREE.Mesh(plane2Geom, planeMaterial);
// Lateral izquierdo
var leftTriangleGeom = new THREE.Geometry(); 
leftTriangleGeom.vertices.push(new THREE.Vector3(dyn.H*dyn.cos_a/dyn.sin_a,0,-dyn.W/2));
leftTriangleGeom.vertices.push(new THREE.Vector3(0,dyn.H,-dyn.W/2));
leftTriangleGeom.vertices.push(new THREE.Vector3(-dyn.H*dyn.cos_b/dyn.sin_b,0,-dyn.W/2));
leftTriangleGeom.faces.push( new THREE.Face3( 0, 2, 1 ) );
leftTriangleGeom.faceVertexUvs[0].push([
  new THREE.UV(0, 0),
  new THREE.UV(1, 0),
  new THREE.UV(0, 1)
]);
leftTriangleGeom.computeFaceNormals();
var leftSidePlane = new THREE.Mesh( leftTriangleGeom, planeMaterial );
// Lateral derecho
var rightTriangleGeom = new THREE.Geometry(); 
rightTriangleGeom.vertices.push(new THREE.Vector3(dyn.H*dyn.cos_a/dyn.sin_a,0,dyn.W/2));
rightTriangleGeom.vertices.push(new THREE.Vector3(0,dyn.H,dyn.W/2));
rightTriangleGeom.vertices.push(new THREE.Vector3(-dyn.H*dyn.cos_b/dyn.sin_b,0,dyn.W/2));
rightTriangleGeom.faces.push( new THREE.Face3( 0, 1, 2 ) );
rightTriangleGeom.faceVertexUvs[0].push([
  new THREE.UV(0, 0),
  new THREE.UV(0, 1),
  new THREE.UV(1, 0)
]);
rightTriangleGeom.computeFaceNormals();
var rightSidePlane = new THREE.Mesh( rightTriangleGeom, planeMaterial );
// Integracion en un mismo objeto
inclinedPlane = new THREE.Object3D();
inclinedPlane.add( plane1 );
inclinedPlane.add( plane2 );
inclinedPlane.add( leftSidePlane );
inclinedPlane.add( rightSidePlane );

inclinedPlane.updateGeometry = function(){ // Actualizar todos los vertices
	// Se actualizan los vectores completos aunque algunas componentes no cambian
	// A esta funcion se accede pocas veces, cuando se modifica algun parametro del plano
	plane1.geometry.vertices[0] = {x:dyn.H*dyn.cos_a/dyn.sin_a, y:0, z:dyn.W/2};
	plane1.geometry.vertices[1] = {x:dyn.H*dyn.cos_a/dyn.sin_a, y:0, z:-dyn.W/2};
	plane1.geometry.vertices[2] = {x:0, y:dyn.H, z:dyn.W/2};
	plane1.geometry.vertices[3] = {x:0, y:dyn.H, z:-dyn.W/2};
	plane1.geometry.verticesNeedUpdate = true;

	plane2.geometry.vertices[0] = {x:-dyn.H*dyn.cos_b/dyn.sin_b, y:0, z:dyn.W/2};
	plane2.geometry.vertices[1] = {x:-dyn.H*dyn.cos_b/dyn.sin_b, y:0, z:-dyn.W/2};
	plane2.geometry.vertices[2] = {x:0, y:dyn.H, z:dyn.W/2};
	plane2.geometry.vertices[3] = {x:0, y:dyn.H, z:-dyn.W/2};
	plane2.geometry.verticesNeedUpdate = true;
	
	leftSidePlane.geometry.vertices[0] = {x:dyn.H*dyn.cos_a/dyn.sin_a,y:0,z:-dyn.W/2};
	leftSidePlane.geometry.vertices[1] = {x:0,y:dyn.H,z:-dyn.W/2};
	leftSidePlane.geometry.vertices[2] = {x:-dyn.H*dyn.cos_b/dyn.sin_b,y:0,z:-dyn.W/2};
	leftSidePlane.geometry.verticesNeedUpdate = true;

	rightSidePlane.geometry.vertices[0] = {x:dyn.H*dyn.cos_a/dyn.sin_a,y:0,z:dyn.W/2};
	rightSidePlane.geometry.vertices[1] = {x:0,y:dyn.H,z:dyn.W/2};
	rightSidePlane.geometry.vertices[2] = {x:-dyn.H*dyn.cos_b/dyn.sin_b,y:0,z:dyn.W/2};
	rightSidePlane.geometry.verticesNeedUpdate = true;	
	
	pulley.position.y = dyn.H + 11;

	line.geometry.vertices[1].y = pulley.position.y + 3*dyn.cos_a;
	line.geometry.vertices[2].y = pulley.position.y + 3*dyn.cos_b;
	line.geometry.verticesNeedUpdate = true;

	box1.rotation.z = -dyn.alpha;
	box2.rotation.z = dyn.beta;

	camera.center.y = dyn.H/2;
	camera.updatePosition(r,theta,phi);

	dyn2Three();
}

scene.add(inclinedPlane);


// POLEA //
var pulleyGeometry = new THREE.CylinderGeometry( 3, 7, 4, 32 );
var pulleyMaterial = new THREE.MeshLambertMaterial( {color: 0xa5a5a5a5} );
var leftPulley = new THREE.Mesh( pulleyGeometry, pulleyMaterial );
var rightPulley = new THREE.Mesh( pulleyGeometry, pulleyMaterial );
leftPulley.position.z = 2;
rightPulley.position.z = -2;
leftPulley.rotation.x = -Math.PI/2
rightPulley.rotation.x = Math.PI/2
pulley = new THREE.Object3D();
pulley.add( leftPulley );
pulley.add( rightPulley );
pulley.position.y = dyn.H + 11;
scene.add( pulley );

// CAJAS //
var boxGeometry = new THREE.CubeGeometry(30,30,30);
var woodTexture = THREE.ImageUtils.loadTexture("img/WoodTexture.jpg");
var mesh = new THREE.MeshBasicMaterial({map:woodTexture});
var box1 = new THREE.Mesh(boxGeometry,mesh);
box1.rotation.z = -dyn.alpha;
scene.add(box1);
var box2 = new THREE.Mesh(boxGeometry,mesh);
box2.rotation.z = dyn.beta;
scene.add(box2);

// CUERDA //
var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
var lineGeometry = new THREE.Geometry();
lineGeometry.vertices.push( box1.position );
lineGeometry.vertices.push( new THREE.Vector3(0,pulley.position.y + 3*dyn.cos_a,0) );
lineGeometry.vertices.push( new THREE.Vector3(0,pulley.position.y + 3*dyn.cos_b,0) );
lineGeometry.vertices.push( box2.position  );
line = new THREE.Line( lineGeometry, lineMaterial );
scene.add(line);


// LUCES //
var light = new THREE.PointLight(0xffffff);
light.position.set(500, 300, -100);
scene.add(light);
var light2 = new THREE.PointLight(0xffffff);
light2.position.set(-500, 300, 100);
scene.add(light2);

camera.center.y = dyn.H/2;
camera.updatePosition(r,theta,phi);

function dyn2Three(){ // Actualizar posicion de los cuerpos
    inclinedPlane.position.x = pulley.position.x = dyn.x3;
	
	box1.position.x = dyn.x1;
	box1.position.y = dyn.H - (dyn.x1-dyn.x3)*dyn.sin_a/dyn.cos_a + 15/dyn.cos_a;
	
	box2.position.x = dyn.x2;
	box2.position.y = dyn.H + (dyn.x2-dyn.x3)*dyn.sin_b/dyn.cos_b + 15/dyn.cos_b;

	line.geometry.vertices[1].x = dyn.x3 + 3*dyn.sin_a;
	line.geometry.vertices[2].x = dyn.x3 - 3*dyn.sin_b;
	line.geometry.verticesNeedUpdate = true;
};

// Animacion
var render = function(){
    canvas.render(scene, camera);
	if(running){
		dyn.step();
		dyn2Three();
	}
    requestAnimationFrame(render);
};

render();
dyn2Three();


// CONTROLES //
var gui = new dat.GUI({width: 300});

var params = {
    m1: dyn.m1,
	m2: dyn.m2,
	m3: dyn.m3,
	b1: dyn.b1,
	b2: dyn.b2,
	b3: dyn.b3,
	L: dyn.L,
	alpha: dyn.alpha*180/Math.PI,
	beta: dyn.beta*180/Math.PI,
	h: dyn.H,
	g: dyn.g,
	play_pause: function(){running = !running},
	reset: function(){dyn.init(); dyn2Three();},
};

var m1_slider = gui.add(params, 'm1',1,10,0.1).name("Masa de la caja 1");
var m2_slider = gui.add(params, 'm2',1,10,0.1).name("Masa de la caja 2");
var m3_slider = gui.add(params, 'm3',1,10,0.1).name("Masa del plano");
var b1_slider = gui.add(params, 'b1',0,5).name("Rozamiento del plano 1");
var b2_slider = gui.add(params, 'b2',0,5).name("Rozamiento del plano 2");
var b3_slider = gui.add(params, 'b3',0,5).name("Rozamiento del suelo");
var L_slider = gui.add(params, 'L',10,100).name("Longitud de la cuerda");
var alpha_slider = gui.add(params, 'alpha',15,85).name("Inclinación del plano 1");
var beta_slider = gui.add(params, 'beta',15,85).name("Inclinación del plano 2");
var h_slider = gui.add(params, 'h',50,300).name("Altura de la cresta");
var g_slider = gui.add(params, 'g',0,20).name("Gravedad");
gui.add(params, 'play_pause').name("Play/Pause");
gui.add(params, 'reset').name("Reset");

m1_slider.onFinishChange(function(val){dyn.m1 = val;});
m2_slider.onFinishChange(function(val){dyn.m2 = val;});
m3_slider.onFinishChange(function(val){dyn.m3 = val;});
b1_slider.onFinishChange(function(val){dyn.b1 = val;});
b2_slider.onFinishChange(function(val){dyn.b2 = val;});
b3_slider.onFinishChange(function(val){dyn.b2 = val;});
alpha_slider.onFinishChange(function(val){dyn.setAlpha(val*Math.PI/180); dyn.init(); inclinedPlane.updateGeometry();});
beta_slider.onFinishChange(function(val){dyn.setBeta(val*Math.PI/180); dyn.init(); inclinedPlane.updateGeometry();});
h_slider.onFinishChange(function(val){dyn.setHeight(val); dyn.init(); inclinedPlane.updateGeometry();});
g_slider.onFinishChange(function(val){dyn.g = val;});
function dynamic(){ 
    this.m1 = 5; // Masa del plano inclinado
	this.m2 = 2; // Masa de la caja
    this.b1 = 0; // Rozamiento entre el suelo y el plano
	this.b2 = 0; // Rozamiento entre el plano y la caja
    this.g = 9.8; // Aceleracion de la gravedad
	
	// Dimensiones del plano
	this.angle = Math.PI/8; // Angulo de inclinacion
	this.tan = Math.tan(this.angle);
	this.cos = Math.cos(this.angle);
	this.W = 300; // Ancho
	this.H = 150; // Largo
	
	this.x1 = 0; // Posicion del plano
	this.x2 = 20; // Posicion de la caja

    this.dt = 0.01; // Paso diferencial de tiempo

    this.t = 0; // Tiempo
	
	this.setAngle = function(angle){
		this.angle = angle;
		this.tan = Math.tan(this.angle);
		this.cos = Math.cos(this.angle);
	};

    this.init = function(){

    };

    this.step = function(){
		this.x1 -= 0.01;
		this.x2 += 0.05;
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
floor.position.x = 200;
scene.add(floor);


// PLANO INCLINADO //
// Textura del plano
var planeTexture = THREE.ImageUtils.loadTexture("img/FloorTexture1.jpg");
var planeMaterial = new THREE.MeshBasicMaterial({map:planeTexture});
// Tapa superior
var topPlaneGeom = new THREE.Geometry();
topPlaneGeom.vertices.push(new THREE.Vector3(dyn.W*Math.cos(dyn.angle), 0, dyn.H/2));
topPlaneGeom.vertices.push(new THREE.Vector3(dyn.W*Math.cos(dyn.angle), 0, -dyn.H/2));
topPlaneGeom.vertices.push(new THREE.Vector3(0, dyn.W*Math.sin(dyn.angle), dyn.H/2));
topPlaneGeom.vertices.push(new THREE.Vector3(0, dyn.W*Math.sin(dyn.angle), -dyn.H/2));
topPlaneGeom.faces.push( new THREE.Face4( 0, 1, 3, 2 ) );
topPlaneGeom.faceVertexUvs[0].push([
  new THREE.UV(1, 0),
  new THREE.UV(0, 0),
  new THREE.UV(0, 1),
  new THREE.UV(1, 1)
]);
topPlaneGeom.computeFaceNormals();
var topPlane = new THREE.Mesh(topPlaneGeom, planeMaterial);
// Tapa posterior
var backPlaneGeom = new THREE.Geometry(); 
backPlaneGeom.vertices.push(new THREE.Vector3(0, 0, dyn.H/2));
backPlaneGeom.vertices.push(new THREE.Vector3(0, 0, -dyn.H/2));
backPlaneGeom.vertices.push(new THREE.Vector3(0, dyn.W*Math.sin(dyn.angle), dyn.H/2));
backPlaneGeom.vertices.push(new THREE.Vector3(0, dyn.W*Math.sin(dyn.angle), -dyn.H/2));
backPlaneGeom.faces.push( new THREE.Face4( 0, 2, 3, 1) );
backPlaneGeom.faceVertexUvs[0].push([
  new THREE.UV(0, 0),
  new THREE.UV(0, 1),
  new THREE.UV(1, 1),
  new THREE.UV(1, 0)
]);
backPlaneGeom.computeFaceNormals();
var backPlane = new THREE.Mesh(backPlaneGeom, planeMaterial);
// Lateral izquierdo
var leftTriangleGeom = new THREE.Geometry(); 
leftTriangleGeom.vertices.push(new THREE.Vector3(0,0,-dyn.H/2));
leftTriangleGeom.vertices.push(new THREE.Vector3(0,dyn.W*Math.sin(dyn.angle),-dyn.H/2));
leftTriangleGeom.vertices.push(new THREE.Vector3(dyn.W*Math.cos(dyn.angle),0,-dyn.H/2));
leftTriangleGeom.faces.push( new THREE.Face3( 0, 1, 2 ) );
leftTriangleGeom.faceVertexUvs[0].push([
  new THREE.UV(0, 0),
  new THREE.UV(1, 0),
  new THREE.UV(0, 1)
]);
leftTriangleGeom.computeFaceNormals();
var leftSidePlane = new THREE.Mesh( leftTriangleGeom, planeMaterial );
// Lateral derecho
var rightTriangleGeom = new THREE.Geometry(); 
rightTriangleGeom.vertices.push(new THREE.Vector3(0,0,dyn.H/2));
rightTriangleGeom.vertices.push(new THREE.Vector3(0,dyn.W*Math.sin(dyn.angle),dyn.H/2));
rightTriangleGeom.vertices.push(new THREE.Vector3(dyn.W*Math.cos(dyn.angle),0,dyn.H/2));
rightTriangleGeom.faces.push( new THREE.Face3( 0, 2, 1 ) );
rightTriangleGeom.faceVertexUvs[0].push([
  new THREE.UV(0, 0),
  new THREE.UV(0, 1),
  new THREE.UV(1, 0)
]);
rightTriangleGeom.computeFaceNormals();
var rightSidePlane = new THREE.Mesh( rightTriangleGeom, planeMaterial );
// Integracion en un mismo objeto
inclinedPlane = new THREE.Object3D();
inclinedPlane.add( topPlane );
inclinedPlane.add( backPlane );
inclinedPlane.add( leftSidePlane );
inclinedPlane.add( rightSidePlane );
inclinedPlane.updateAngle = function(){ // Modificar el angulo del plano
	topPlane.geometry.vertices[0].x = dyn.W*Math.cos(dyn.angle);
	topPlane.geometry.vertices[1].x = dyn.W*Math.cos(dyn.angle);
	topPlane.geometry.vertices[2].y = dyn.W*Math.sin(dyn.angle);
	topPlane.geometry.vertices[3].y = dyn.W*Math.sin(dyn.angle);
	topPlane.geometry.verticesNeedUpdate = true;
	
	backPlane.geometry.vertices[2].y = dyn.W*Math.sin(dyn.angle);
	backPlane.geometry.vertices[3].y = dyn.W*Math.sin(dyn.angle);
	backPlane.geometry.verticesNeedUpdate = true;
	
	leftSidePlane.geometry.vertices[1].y = dyn.W*Math.sin(dyn.angle);
	leftSidePlane.geometry.vertices[2].x = dyn.W*Math.cos(dyn.angle);
	leftSidePlane.geometry.verticesNeedUpdate = true;
	
	rightSidePlane.geometry.vertices[1].y = dyn.W*Math.sin(dyn.angle);
	rightSidePlane.geometry.vertices[2].x = dyn.W*Math.cos(dyn.angle);
	rightSidePlane.geometry.verticesNeedUpdate = true;	
	
	box.rotation.z = -dyn.angle;
	
	dyn2Three();
}
scene.add(inclinedPlane);


// CAJA //
var boxGeometry = new THREE.CubeGeometry(30,30,30);
var woodTexture = THREE.ImageUtils.loadTexture("img/WoodTexture.jpg");
var mesh = new THREE.MeshBasicMaterial({map:woodTexture});
var box = new THREE.Mesh(boxGeometry,mesh);
box.rotation.z = -dyn.angle;
scene.add(box);


// LUCES //
var light = new THREE.PointLight(0xffffff);
light.position.set(0, 300, 0);
scene.add(light);

var light2 = new THREE.PointLight(0xffffff);
light2.position.set(500, 20, 500);
scene.add(light2);


function dyn2Three(){ // Actualizar posicion de los cuerpos
    inclinedPlane.position.x = dyn.x1;
	box.position.x = dyn.x2;
	box.position.y = (dyn.W*dyn.cos - dyn.x2 + dyn.x1)*dyn.tan + 15/dyn.cos;
	
	// Luego de se separen
	//box.position.y = 15;
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
	b1: dyn.b1,
	b2: dyn.b2,
	angle: dyn.angle*180/Math.PI,
	g: dyn.g,
	play_pause: function(){running = !running}
};

var m1_slider = gui.add(params, 'm1',1,10,0.1).name("Masa del plano");
var m2_slider = gui.add(params, 'm2',1,10,0.1).name("Masa de la caja");
var b1_slider = gui.add(params, 'b1',0,5).name("Rozamiento del suelo");
var b2_slider = gui.add(params, 'b2',0,5).name("Rozamiento del plano");
var angle_slider = gui.add(params, 'angle',0,85).name("Inclinación del plano");
var g_slider = gui.add(params, 'g',0,20).name("Gravedad");
gui.add(params, 'play_pause').name("Play/Pause");

m1_slider.onFinishChange(function(val){dyn.m1 = val;});
m2_slider.onFinishChange(function(val){dyn.m2 = val;});
b1_slider.onFinishChange(function(val){dyn.b1 = val;});
b2_slider.onFinishChange(function(val){dyn.b2 = val;});
angle_slider.onFinishChange(function(val){dyn.setAngle(val*Math.PI/180); inclinedPlane.updateAngle();});
g_slider.onFinishChange(function(val){dyn.g = val;});
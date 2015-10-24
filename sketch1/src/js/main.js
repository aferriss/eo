// Include jQuery plugins and polyfills
require('./plugins');

var THREE = require('three');
// This is how you can use GLSLify
// This can be done in any.js file, just pay attention to paths
var glslify = require('glslify');

var scene, camera, renderer;
var geometry, material, mesh;
var rtt, blurShader;
var rttScene;
var orthoCamera;
var plane;
var finalScene;
var hBlurRtt, finalSceneRtt;
var sharpenShader;
var sharpenScene, sharpenSceneRtt;
var tempScene;
var tempRtt;
init();
animate();

var w;
var h;

function init() {

  w = window.innerWidth;
  h = window.innerHeight;

  scene = new THREE.Scene();
  rttScene = new THREE.Scene();
  finalScene = new THREE.Scene();
  sharpenScene = new THREE.Scene();
  tempScene = new THREE.Scene();

  rtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat});
  hBlurRtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat});
  finalSceneRtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat});
  sharpenSceneRtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat});
  tempRtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat});

  
  orthoCamera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 1000;

  rttScene.add(orthoCamera);
  finalScene.add(orthoCamera);
  sharpenScene.add(orthoCamera);

  geometry = new THREE.BoxGeometry( 200, 200, 200 );
  plane = new THREE.PlaneGeometry(w, h);

  material = new THREE.ShaderMaterial({
    vertexShader: glslify('../shaders/sample_vert.glsl'),
    fragmentShader: glslify('../shaders/sample_frag.glsl')
  });

  blurShader = new THREE.ShaderMaterial({
    uniforms: {
      res: {type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
      srcTex: {type: 't', value: rtt},
      direction: {type:'v2', value: new THREE.Vector2(1.0,0.0)}
    },
    vertexShader: glslify('../shaders/blurVert.glsl'),
    fragmentShader: glslify('../shaders/blurFrag.glsl'),
    side: THREE.DoubleSide
  });

  sharpenShader = new THREE.ShaderMaterial({
    uniforms: {
      step_w: {type: 'f', value: 1.0/w},
      step_h: {type: 'f', value: 1.0/h},
      tex: {type:'t', value: finalSceneRtt }
    },
    vertexShader: glslify('../shaders/sharpenVert.glsl'),
    fragmentShader: glslify('../shaders/sharpenFrag.glsl'),
    side: THREE.DoubleSide
  });


  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  mesh = new THREE.Mesh( plane, blurShader);
  rttScene.add(mesh);

  mesh = new THREE.Mesh(plane, blurShader);
  finalScene.add(mesh);

  mesh = new THREE.Mesh(plane, sharpenShader);
  sharpenScene.add(mesh);

  var sharpenMat = new THREE.MeshBasicMaterial({map:sharpenSceneRtt});
  var mesh2 = new THREE.Mesh(plane, sharpenMat);
  tempScene.add(mesh2);


  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );

  document.body.appendChild( renderer.domElement );

}

var inc = 0;
function animate() {
  requestAnimationFrame( animate );

  var rotAmt = 0.001;

  if( Math.floor((mesh.rotation.y * (180/Math.PI))) % 180 < 10 || Math.floor((mesh.rotation.y * (180/Math.PI))) % 180 > 170){
    rotAmt = 0.0001;
  } else{
    rotAmt = 0.01;
  }
  //mesh.rotation.x += 0.01;
  mesh.rotation.y += rotAmt;
console.log(Math.floor((mesh.rotation.y * (180/Math.PI))) % 180);

  blurShader.uniforms.direction.value = new THREE.Vector2(1.0,0.0);
  if(inc == 0){
    blurShader.uniforms.srcTex.value = rtt;
  }
  else{
    blurShader.uniforms.srcTex.value = tempRtt;
  }

  renderer.render(scene, camera, rtt );

  renderer.render(rttScene, orthoCamera, hBlurRtt);

  blurShader.uniforms.srcTex.value = hBlurRtt;
  blurShader.uniforms.direction.value = new THREE.Vector2(0.0,1.0);

  
  //iterate over the blur a bunch
  for(var i = 0; i<1; i++){
  renderer.render(finalScene, orthoCamera, rtt);

  blurShader.uniforms.direction.value = new THREE.Vector2(1.0,0.0);
  blurShader.uniforms.srcTex.value = rtt;
  renderer.render(rttScene, orthoCamera, hBlurRtt);

  blurShader.uniforms.srcTex.value = hBlurRtt;
  blurShader.uniforms.direction.value = new THREE.Vector2(0.0,1.0);
  }
  

  renderer.render(finalScene, orthoCamera, finalSceneRtt);
  renderer.render(sharpenScene, orthoCamera, sharpenSceneRtt);
  renderer.render(tempScene, orthoCamera, tempRtt);

  renderer.render(tempScene, orthoCamera);
  
  inc++;
}
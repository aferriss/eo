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
var hBlurRtt;

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

  rtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat});
  hBlurRtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat});
  
  orthoCamera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 1000;

  rttScene.add(orthoCamera);
  finalScene.add(orthoCamera);

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

  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  mesh = new THREE.Mesh( plane, blurShader);
  
  rttScene.add(mesh);

  mesh = new THREE.Mesh(plane, blurShader);
  finalScene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );

  document.body.appendChild( renderer.domElement );

}

function animate() {
  requestAnimationFrame( animate );

  //mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;

  blurShader.uniforms.direction.value = new THREE.Vector2(1.0,0.0);
  blurShader.uniforms.srcTex.value = rtt;

  renderer.render(scene, camera, rtt );
  renderer.render(rttScene, orthoCamera, hBlurRtt);

  blurShader.uniforms.srcTex.value = hBlurRtt;
  blurShader.uniforms.direction.value = new THREE.Vector2(0.0,1.0);

  for(var i = 0; i<10; i++){
  renderer.render(finalScene, orthoCamera, rtt);

  blurShader.uniforms.direction.value = new THREE.Vector2(1.0,0.0);
  blurShader.uniforms.srcTex.value = rtt;
  renderer.render(rttScene, orthoCamera, hBlurRtt);

  blurShader.uniforms.srcTex.value = hBlurRtt;
  blurShader.uniforms.direction.value = new THREE.Vector2(0.0,1.0);
  }


  renderer.render(finalScene, orthoCamera);

  


}
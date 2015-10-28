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
var tempRtt;
var colorMapScene;
var inc = 0;
init();
animate();
var omesh;

var w;
var h;

function init() {

  w = window.innerWidth;
  h = window.innerHeight;

  scene = new THREE.Scene();
  rttScene = new THREE.Scene();
  finalScene = new THREE.Scene();
  sharpenScene = new THREE.Scene();
  colorMapScene = new THREE.Scene();

  rtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat});
  hBlurRtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat});
  finalSceneRtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat});
  sharpenSceneRtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat});

  
  orthoCamera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 1000;

  rttScene.add(orthoCamera);
  finalScene.add(orthoCamera);
  sharpenScene.add(orthoCamera);
  colorMapScene.add(orthoCamera);

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
      direction: {type:'v2', value: new THREE.Vector2(1.0,0.0)},
      step_w: {type: 'f', value: 0.89/w},
      step_h: {type: 'f', value: 0.89/h},
    },
    vertexShader: glslify('../shaders/blurVert.glsl'),
    fragmentShader: glslify('../shaders/blurFrag.glsl'),
    side: THREE.DoubleSide,
    transparent: true,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor
  });

  sharpenShader = new THREE.ShaderMaterial({
    uniforms: {
      step_w: {type: 'f', value: 0.15/w},
      step_h: {type: 'f', value: 0.15/h},
      tex: {type:'t', value: rtt }
    },
    vertexShader: glslify('../shaders/sharpenVert.glsl'),
    fragmentShader: glslify('../shaders/sharpenFrag.glsl'),
    side: THREE.DoubleSide,
    transparent: true,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor
  });

  var colorMapShader = new THREE.ShaderMaterial({
    vertexShader: glslify('../shaders/sharpenVert.glsl'),
    fragmentShader: glslify('../shaders/colorMapShader.glsl'),
    uniforms:{
      tex: {type: 't', value: sharpenSceneRtt}
    }
  });


  omesh = new THREE.Mesh( geometry, material );
  scene.add( omesh );

  mesh = new THREE.Mesh( plane, blurShader);
  rttScene.add(mesh);

  mesh = new THREE.Mesh(plane, blurShader);
  finalScene.add(mesh);

  mesh = new THREE.Mesh(plane, sharpenShader);
  sharpenScene.add(mesh);

  mesh = new THREE.Mesh(plane, colorMapShader);
  colorMapScene.add(mesh);


  //renderer = new THREE.WebGLRenderer();
  renderer = new THREE.WebGLRenderer({alpha: false, preserveDrawingBuffer:true, antialias:false});
  renderer.setPixelRatio(window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.sortObjects = false;

  renderer.autoClear = false;
  //renderer.autoClearColor = false;
  //renderer.autoClearDepth = true;
  

  console.log(renderer.getClearAlpha());
  

  document.body.appendChild( renderer.domElement );

}



function animate() {
  requestAnimationFrame( animate );

  var rotAmt = 0.001;

  if( Math.floor((mesh.rotation.y * (180/Math.PI))) % 180 < 10 || Math.floor((mesh.rotation.y * (180/Math.PI))) % 180 > 170){
    rotAmt = 0.0001;
  } else{
    rotAmt = 0.01;
  }
  //mesh.rotation.x += rotAmt * 100.5;
  //mesh.rotation.y += rotAmt;
  //mesh.rotation.z += 0.0000005;
  //mesh.scale.x = mesh.scale.y += 0.01;

  //console.log(Math.floor((mesh.rotation.y * (180/Math.PI))) % 180);

  blurShader.uniforms.direction.value = new THREE.Vector2(1.0,0.0);

  if(inc === 0){
    renderer.render(scene, camera, rtt);
  } 
  //else{
    //blurShader.uniforms.srcTex.value = sharpenSceneRtt;
  //}
  

  renderer.render(rttScene, orthoCamera, hBlurRtt, false);

  blurShader.uniforms.srcTex.value = hBlurRtt;
  blurShader.uniforms.direction.value = new THREE.Vector2(0.0,1.0);
  renderer.render(finalScene, orthoCamera, rtt, false);


  //iterate over the blur a bunch
  for(var i = 0; i<1; i++){

    blurShader.uniforms.srcTex.value = rtt;
    renderer.render(rttScene, orthoCamera, hBlurRtt, false);

    blurShader.uniforms.srcTex.value = hBlurRtt;
    renderer.render(finalScene, orthoCamera, rtt, false);

  }
  
  
  //renderer.render(sharpenScene, orthoCamera);
  renderer.render(sharpenScene, orthoCamera, sharpenSceneRtt, false);
  renderer.render(colorMapScene, orthoCamera);
  blurShader.uniforms.srcTex.value = sharpenSceneRtt;
/*
  omesh.rotation.z += 0.001;
  omesh.rotation.x += 0.01;
  omesh.position.x = Math.sin(inc*0.05)*200;
  //omesh.position.x += 1;

  renderer.render(scene, camera);
*/

  inc++;
}
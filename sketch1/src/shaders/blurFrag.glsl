#pragma glslify: blur = require('glsl-fast-gaussian-blur')

uniform vec2 res;
uniform sampler2D srcTex;
uniform vec2 direction;

varying vec2 v_texCoord;

void main() {
	vec2 uv = v_texCoord;
 	gl_FragColor = blur(srcTex, uv, res*0.5, direction);
  
  //gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}
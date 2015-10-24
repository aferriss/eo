varying vec2 v_texCoord;

uniform sampler2D tex;
uniform float step_w;
uniform float step_h;

vec2 offset[9];

void main() {

	vec2 tc = v_texCoord;
	vec4 input0 = texture2D(tex,tc);

	vec2 x1 = vec2(step_w, 0.0);
	vec2 y1 = vec2(0.0, step_h);   

	input0 += texture2D(tex, tc+x1); // right
	input0 += texture2D(tex, tc-x1); // left
	input0 += texture2D(tex, tc+y1); // top
	input0 += texture2D(tex, tc-y1); // bottom

	input0*=vec4(0.2);

	float kernel[9];

	offset[0] = vec2(-step_w, -step_h);
	offset[1] = vec2(0.0, -step_h);
	offset[2] = vec2(step_w, -step_h);
	offset[3] = vec2(-step_w, 0.0);
	offset[4] = vec2(0.0, 0.0);
	offset[5] = vec2(step_w, 0.0);
	offset[6] = vec2(-step_w, step_h);
	offset[7] = vec2(0.0, step_h);
	offset[8] = vec2(step_w, step_h);

	kernel[0] = 0.666; kernel[1] = 0.666; kernel[2] = 0.0;
	kernel[3] = 0.666; kernel[4] = 0.0; kernel[5] = 0.0;
	kernel[6] = 0.0; kernel[7] = 0.00; kernel[8] = -2.0;
	
	vec4 sum = input0;

	for (int i = 0; i < 9; i++) {
		sum += texture2D(tex,tc+offset[i])*(kernel[i]);
	}

	gl_FragColor = sum + vec4(0.00991,0.00992,0.00993,0.0);
}

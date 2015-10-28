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
	float kernel2[9];

	offset[0] = vec2(-step_w, -step_h);
	offset[1] = vec2(0.0, -step_h);
	offset[2] = vec2(step_w, -step_h);
	offset[3] = vec2(-step_w, 0.0);
	offset[4] = vec2(0.0, 0.0);
	offset[5] = vec2(step_w, 0.0);
	offset[6] = vec2(-step_w, step_h);
	offset[7] = vec2(0.0, step_h);
	offset[8] = vec2(step_w, step_h);

	kernel[0] = 1.75; kernel[1] = 0.0; kernel[2] = -1.5;
	kernel[3] = 1.75; kernel[4] = 0.0; kernel[5] = -1.5;
	kernel[6] = 1.75; kernel[7] = 0.0; kernel[8] = -1.5;

	kernel2[0] = 1.5; kernel2[1] = 1.5; kernel2[2] = 1.5;
	kernel2[3] = 0.0; kernel2[4] = 0.0; kernel2[5] = 0.0;
	kernel2[6] = -1.5; kernel2[7] = -1.5; kernel2[8] = -1.5;
	
	vec4 sum = input0;
	vec4 sum2 = input0;

	for (int i = 0; i < 9; i++) {
		sum += texture2D(tex,tc+offset[i])*(kernel[i]);
		sum2 += texture2D(tex,tc+offset[i])*(kernel2[i]);
	}

	vec2 grads = vec2(length(sum.rgb), length(sum2.rgb));

	float fc = length(grads);

	float texelWidth = step_w;

	vec2 right = v_texCoord.xy + vec2(texelWidth, 0.0),
          left = v_texCoord.xy + vec2(-texelWidth, 0.0),
          top = v_texCoord.xy + vec2(0.0, -texelWidth),
          bottom = v_texCoord.xy + vec2(0.0, texelWidth);

    vec2 gradient = vec2(length(texture2D(tex, right).xyz
                                -texture2D(tex, left).xyz),
                         length(texture2D(tex, top).xyz 
                                -texture2D(tex, bottom).xyz));


	gl_FragColor = vec4(length(gradient)*10.0);//+ vec4(0.0091,0.0092,0.0093,0.0);
	gl_FragColor.rgb -= 0.001;

	float avg = dot(vec3(1.0), gl_FragColor.rgb)*0.333;
	gl_FragColor.rgb = avg < 0.1 ? vec3(1.0) : gl_FragColor.rgb;


}	

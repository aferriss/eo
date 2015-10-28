varying vec2 v_texCoord;
uniform sampler2D srcTex;
uniform float step_w;
uniform float step_h;

      vec2 offset[9];

      void main() {

        vec4 input0 = texture2D(srcTex,v_texCoord);

        float kernel[9];

        vec4 sum = input0;


        offset[0] = vec2(-step_w, -step_h);
        offset[1] = vec2(0.0, -step_h);
        offset[2] = vec2(step_w, -step_h);
        offset[3] = vec2(-step_w, 0.0);
        offset[4] = vec2(0.0, 0.0);
        offset[5] = vec2(step_w, 0.0);
        offset[6] = vec2(-step_w, step_h);
        offset[7] = vec2(0.0, step_h);
        offset[8] = vec2(step_w, step_h);

        kernel[0] = 1.0; kernel[1] = 1.0; kernel[2] = 1.0;
        kernel[3] = 1.0; kernel[4] = 1.0; kernel[5] = 1.0;
        kernel[6] = 1.0; kernel[7] = 1.0; kernel[8] = 1.0;

        for (int i = 0; i < 9; i++) {
            sum += texture2D(srcTex,v_texCoord+offset[i])*(kernel[i]);
        }
        sum /= 9.0;


        gl_FragColor = sum;
}
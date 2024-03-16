uniform vec3 u_lowColor;
uniform vec3 u_highColor;
varying vec2 vUv;
varying float vEle;

void main() {

  vec3 mixed = mix(u_highColor,u_lowColor,vEle*3.145);
  gl_FragColor = vec4(mixed,1.0);
}
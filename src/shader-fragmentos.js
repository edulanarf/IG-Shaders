import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, mesh;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 2;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  new OrbitControls(camera, renderer.domElement);

  const geometry = new THREE.PlaneGeometry(2, 2);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0 },
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    },
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position,1.0);
      }
    `,
    fragmentShader: `
      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
       vec2 uv=(gl_FragCoord.xy/u_resolution-.5)*2.;
       float t=u_time*.3,v=0.;
       for(int i=0;i<100;i++){
        float fi=float(i),r=length(uv+.3*vec2(sin(t+fi),cos(t*1.4+fi*2.)));
        v+=sin(8.*r-fi*1.3+t*3.)/(1.+r*2.);
       }
       vec3 c=.5+.5*cos(vec3(0,1,1)+v*8.+t*6.);
       gl_FragColor=vec4(c,1.);
      }
    `,
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  window.addEventListener("resize", onResize);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  mesh.material.uniforms.u_resolution.value.set(
    window.innerWidth,
    window.innerHeight
  );
}

function animate() {
  requestAnimationFrame(animate);
  mesh.material.uniforms.u_time.value += 0.02;
  renderer.render(scene, camera);
}

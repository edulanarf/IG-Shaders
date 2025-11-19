import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "dat.gui";

let scene, renderer;
let camera;
let camcontrols1;
let objetos = [];

const gui = new dat.GUI();
const params = {
  tipoCubo: "Tierra",
  shader: "Iluminacion",
};

const cubos = {
  Tierra: "dirt.glb",
  Piedra: "stone.glb",
  Madera: "wood.glb",
  Hielo: "ice.glb",
  Oveja: "sheep.glb",
  Cerdo: "pig.glb",
  Slime: "slime.glb",
};

gui
  .add(params, "tipoCubo", Object.keys(cubos))
  .name("Tipo de cubo")
  .onChange((value) => {
    objetos.forEach((obj) => scene.remove(obj));
    objetos = [];
    ModelShader(cubos[value], 0, 0, 0, 1);
  });

init();
animationLoop();

function init() {
  //Defino cámara
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  ModelShader(cubos[params.tipoCubo], 0, 0, 0, 1);
  camcontrols1 = new OrbitControls(camera, renderer.domElement);
}

function ModelShader(path, px, py, pz, scale = 1) {
  const loader = new GLTFLoader();

  loader.load(path, (gltf) => {
    const modelo = gltf.scene;

    modelo.traverse((child) => {
      if (child.isMesh) {
        const originalTexture = child.material.map;

        child.material = new THREE.ShaderMaterial({
          uniforms: {
            u_texture: { value: originalTexture },
            u_time: { value: 0.0 },
          },
          vertexShader: vertexShader(),
          fragmentShader: fragmentShader(),
        });
      }
    });

    modelo.position.set(px, py, pz);
    modelo.scale.set(scale, scale, scale);

    scene.add(modelo);
    objetos.push(modelo);
  });
}

function vertexShader() {
  return `
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
        vUv = uv;
        vNormal = normalMatrix * normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;
}

function fragmentShader() {
  return `
  uniform sampler2D u_texture;
  uniform float u_time;
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
      vec4 texColor = texture2D(u_texture, vUv);
  
      //Iluminación
      vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
      vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
      vec3 normal = normalize(vNormal);
  
      // Luz difusa
      float diff = max(dot(normal, lightDir), 0.0);
  
      // Luz especular
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
  
      // Luz ambiental
      float ambient = 0.2;
  
      vec3 color = texColor.rgb * (diff + ambient) + vec3(spec);
  
      gl_FragColor = vec4(color, 1.0);
  }
  
  
    `;
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);

  objetos.forEach((obj) => {
    obj.traverse((child) => {
      if (child.isMesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if (mat.uniforms && mat.uniforms.u_time) {
              mat.uniforms.u_time.value += 0.05;
            }
          });
        } else {
          if (child.material.uniforms && child.material.uniforms.u_time) {
            child.material.uniforms.u_time.value += 0.05;
          }
        }
      }
    });
  });

  renderer.render(scene, camera);
}

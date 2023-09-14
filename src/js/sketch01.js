import * as THREE from 'three';

import $ from "jquery";
import { BasicTemplate } from "./templates/BasicTemplate";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

$(()=> { new Main(); });
class Main extends BasicTemplate {
    constructor() {
        super(1920, 1920);
        
        const uvMaterial = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: uvFrag,
            side: THREE.DoubleSide,
            transparent: true
        });

        const geometry = new THREE.PlaneGeometry(1000, 1000);
        const mesh = new THREE.Mesh(geometry, uvMaterial);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.scene.add(mesh);
    }

    update() {
        this.orbitControls.update();
    }
}

// --------------------------------------------

const vert = `
varying vec2 vUv;
varying vec3 vNormal;

void main()
{
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}`;

const uvFrag = `
varying vec2 vUv;
varying vec3 vNormal;

void main( void ) {
    vec4 color = vec4(vUv, 1.0, 1.0);
    gl_FragColor = color;
}`;
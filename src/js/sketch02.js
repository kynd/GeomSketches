import * as THREE from 'three';

import $ from "jquery";
import { BasicTemplate } from "./templates/BasicTemplate";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mapToQuad, dataToGeom } from './utils/GeometryUtil.js';

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

        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        for (let i = 0; i < 3; i ++) {
            let frag;
            switch(i) {
            case 0:
                frag = uvFrag;
                break;
            case 1:
                frag = euvFrag;
                break;
            default:
                frag = renderFrag;
                break;
            }
          
            const material = new THREE.ShaderMaterial({
            vertexShader: vert, fragmentShader: frag, 
            side: THREE.DoubleSide,
            transparent: true
            });
  
            const vertices = [
                new THREE.Vector3(-100, -400, 0),
                new THREE.Vector3(100, -400, 0),
                new THREE.Vector3(-100, 400, 0),
                new THREE.Vector3(100, 400, 0)
                ]
            const mesh = createMesh(material, vertices);
            
            this.scene.add(mesh);
            mesh.position.x = (i - 1) * 240;
        }
    }

    update() {
        this.orbitControls.update();
    }
}


// --------------------------------------------

function createMesh(material, vertices) {
      const geomData = createGeom(vertices, mapToQuad);
      const geometry = dataToGeom(geomData);
      return new THREE.Mesh(geometry, material);
}

function createGeom(corners, map) {
    const center = map(new THREE.Vector2(0, 0), corners);
    const nPoints = [];
    const points = [];
    const edgePoints = [];
    const res = 48;
    for (let i = 0; i <= res; i ++) {
      const theta = Math.PI * 2 * i / res - Math.PI * 0.5;
      let x = Math.cos(theta);
      
      x = Math.pow(Math.abs(x), 2.0) * (x < 0 ? -1 : 1);
      const y = Math.sin(theta);
      const n = new THREE.Vector2(x, y);
      const p = map(n, corners);
      nPoints.push(n)
      points.push(p);
    }

    const positions = new Float32Array(points.length * 3 * 3);
    const euvs = new Float32Array(points.length * 3 * 2);
    const uvs = new Float32Array(points.length * 3 * 2);
    for (let i = 0; i < points.length; i ++) {
        const p0 = points[i];
        const p1 = points[(i + 1) % points.length];
        addPosAttrData(positions, i * 3, p0);
        addPosAttrData(positions, i * 3 + 1, p1);
        addPosAttrData(positions, i * 3 + 2, center);
        const v0 = i / points.length;
        const v1 = (i + 1) / points.length;

        addAttrData(euvs, i * 3, 2, [1, v0]);
        addAttrData(euvs, i * 3 + 1, 2, [1, v1]);
        addAttrData(euvs, i * 3 + 2, 2, [0.0, (v0 + v1) * 0.5]);
      
        const n0 = nPoints[i];
        const n1 = nPoints[(i + 1) % nPoints.length];
        addAttrData(uvs, i * 3, 2, [(n0.x + 1) * 0.5, (n0.y + 1) * 0.5]);
        addAttrData(uvs, i * 3 + 1, 2, [(n1.x + 1) * 0.5, (n1.y + 1) * 0.5]);
        addAttrData(uvs, i * 3 + 2, 2, [0.5, 0.5]);
    }

    return [
        { name:"position", data:positions, stride: 3},
        { name:"uv", data:uvs, stride: 2 },
        { name:"euv", data:euvs, stride: 2 },
    ];
}

// --------------------------------------------

function addAttrData(arr, idx, size, data) {
    for (let i = 0; i < size; i ++) {
        arr[idx * size + i] = data[i];
    }
}

function addPosAttrData(arr, idx, p) {
    arr[idx * 3] = p.x;
    arr[idx * 3 + 1] = p.y;
    arr[idx * 3 + 2] = p.z;
}
// --------------------------------------------

const vert = `
attribute vec2 euv;
varying vec2 vUv;
varying vec2 vEUv;
varying vec3 vNormal;

void main()
{
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vEUv = euv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}`;

const uvFrag = `
varying vec2 vUv;
varying vec2 vEUv;
varying vec3 vNormal;

void main( void ) {
    vec4 color = vec4(vUv, 1.0, 1.0);
    gl_FragColor = color;
}`;

const euvFrag = `
varying vec2 vUv;
varying vec2 vEUv;
varying vec3 vNormal;

void main( void ) {
    vec4 color = vec4(vEUv, 1.0, 1.0);
    gl_FragColor = color;
}`;

const renderFrag = `
varying vec2 vUv;
varying vec2 vEUv;
varying vec3 vNormal;

#define PI 3.14159265359

void main( void ) {
    vec4 color = vec4(0.2, 0.6, 0.2, 1.0);
    color = mix(color, vec4(0.3, 0.2, 0.1, 1.0), vUv.x);
    color = mix(color, vec4(0.6, 0.2, 0.4, 1.0), vUv.y);
    float freq = 1.0;
    float edgeTH = 1.0 - (cos(vEUv.y * PI * 2.0 * freq) + 1.0) * 0.04;
    float m = smoothstep(edgeTH - 0.1, edgeTH, vEUv.x);
    color = mix(color, vec4(0.9, 0.8, 0.6, 1.0), vEUv.y * 0.2);
    color = mix(color, vec4(0.9, 0.8, 0.6, 1.0), m * 0.5);
    color = mix(color, vec4(0.1, 0.4, 0.1, 1.0), pow(1.0 - abs(vUv.x - 0.5), 10.0) * 0.25);
    gl_FragColor = color;
}`;
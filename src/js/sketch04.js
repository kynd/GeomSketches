import * as THREE from 'three';
import $ from "jquery";

import {Noise} from "noisejs";
import { BasicTemplate } from "./templates/BasicTemplate";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { line } from './utils/GeometryUtil.js';
import { saveCanvasImage } from './utils/FileUtil.js';

$(()=> {new Main();});

class Main extends BasicTemplate {
    constructor() {
        super(1920, 1920);
        
        this.renderer.setClearColor(new THREE.Color(0xFFFFFFFF));
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        const offset = new THREE.Vector3(Math.random() * 100);
        for (let j = -200; j <= 200; j ++) {
            const vertices = [];
            for (let i = -200; i <= 200; i ++) {
                const v = new THREE.Vector3(i * 4, j * 4, 0);
                vertices.push(v);
            }
            warp(vertices, offset);
            const mesh = line(vertices, new THREE.Color(0x000000));
            this.scene.add(mesh);
        }
    }
    update() {
        
    }
}

function warp(vertices, offset = new THREE.Vector3()) {
    vertices.forEach((v , i) => {
        const t = i / (vertices.length - 1);

        const m = 1.0 - Math.pow(Math.abs(t - 0.5) * 2.0, 2.5);
        const noiseCrd = v.clone().multiplyScalar(0.002).add(offset);
        v.add(noise3D(noiseCrd).multiplyScalar(m * 1000));
    });
}

function noise3D(v) {
    const noise = new Noise();
    const a = v.clone().toArray();
    const b = v.clone().clone().add(new THREE.Vector3(1234.2345)).toArray();
    const c = v.clone().clone().add(new THREE.Vector3(2345.3456)).toArray();
    return new THREE.Vector3(
        noise.simplex3(...a),
        noise.simplex3(...b),
        noise.simplex3(...c)
    )
}
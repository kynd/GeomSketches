import * as THREE from 'three';
import $ from "jquery";

import { saveCanvasImage, ImageSequenceSaver } from "../utils/FileUtil.js";

export class BasicTemplate {
    constructor(w, h) {
        this.frameCount = 0;
        this.paused = false;
        this.width = w;
        this.height = h;

        // Camera
        const fov = 65;
        const hFovRadian = fov / 2 / 180 * Math.PI;
        const cz = this.height / 2 / Math.tan(hFovRadian);
        this.camera = new THREE.PerspectiveCamera(fov, this.width/this.height, 0.1, cz * 4 );
        this.camera.position.z = cz;

        // Renderers
        this.renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
        this.renderer.setSize( this.width, this.height );
        this.canvasElm = this.renderer.domElement;
        this.canvas = $(this.canvasElm);
        $('#main').append(this.canvas);
        $('#main').css({width: this.width * 0.5, height: this.height * 0.5});

        this.scene = new THREE.Scene();

        requestAnimationFrame( this.animate.bind(this) );


        document.addEventListener('keydown', (evt)=> {
            if (evt.key === ' ') {
                saveCanvasImage(this.canvasElm);
            }
        });
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        if (this.paused) {return;}
        this.update();
        this.render();
        this.frameCount ++;
    }

    update() {}
    render() {
        this.renderer.render(this.scene, this.camera);
    };

    async saveCanvasImage() {
        this.paused = true;
        await saveCanvasImage(this.canvasElm);
        this.paused = false;
    }

    // ------------------

    async showDirectoryPicker() {
        this.imageSaver = new ImageSequenceSaver();
        await this.imageSaver.showDirectoryPicker();
    }

    async saveCanvasImageSequence() {
        console.log(this.imageSaver)
        this.paused = true;
        if (this.imageSaver) {
            console.log("saving")
            await this.imageSaver.saveCanvasImage(this.canvasElm);
        }
        this.paused = false;
    }
}
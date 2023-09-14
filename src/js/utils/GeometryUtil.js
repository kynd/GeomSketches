import * as THREE from 'three';


// BEZIER 

export function qubicBezier(p0, p1, p2, p3, t) {
    const x = qubicBezier1D(p0.x, p1.x, p2.x, p3.x, t);
    const y = qubicBezier1D(p0.y, p1.y, p2.y, p3.y, t);
    if (p0.hasOwnProperty("z")) {
        const z = qubicBezier1D(p0.z, p1.z, p2.z, p3.z, t);
        return new THREE.Vector3(x, y, z);
    } else {
        return new THREE.Vector2(x, y);
    }
}

export function qubicBezier1D(p0, p1, p2, p3, t) {
    return Math.pow(1 - t, 3) * p0 + 3 * Math.pow(1 - t, 2) * t * p1 + 3 * (1 - t) * Math.pow(t, 2) * p2 + Math.pow(t, 3) * p3;
}

// SHAPE MAP

export function mapToQuad(p, corners) {
    const xt = (p.x + 1) * 0.5;
    const yt = (p.y + 1) * 0.5;
    const mxA = new THREE.Vector3().lerpVectors(corners[0], corners[1], xt);
     const mxB = new THREE.Vector3().lerpVectors(corners[2], corners[3], xt);   
                                             
    const np = new THREE.Vector3().lerpVectors(mxA, mxB, yt);
    return np;
}

// GEOMETRY

export function line(points, color) {
    const material = new THREE.LineBasicMaterial({ color });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    return line;
}

export function dataToGeom(data) {
    const geometry = new THREE.BufferGeometry();
    data.forEach((attr)=>{
        geometry.setAttribute(attr.name, new THREE.BufferAttribute(attr.data, attr.stride));
    });
    return geometry;
}

export function disposeObject(obj) {
    if (obj.parent) {
        obj.parent.remove(obj);
    }

    if (obj.geometry) {
        obj.geometry.dispose();
    }

    if (obj.material) {
        if (Array.isArray(obj.material)) {
            obj.material.forEach((material) => {
                if (material.map) {
                    material.map.dispose();
                }
                if (material.lightMap) {
                    material.lightMap.dispose();
                }
                if (material.bumpMap) {
                    material.bumpMap.dispose();
                }
                if (material.normalMap) {
                    material.normalMap.dispose();
                }
                if (material.specularMap) {
                    material.specularMap.dispose();
                }
                if (material.envMap) {
                    material.envMap.dispose();
                }
                material.dispose();
            });
        } else {
            if (obj.material.map) {
                obj.material.map.dispose();
            }
            if (obj.material.lightMap) {
                obj.material.lightMap.dispose();
            }
            if (obj.material.bumpMap) {
                obj.material.bumpMap.dispose();
            }
            if (obj.material.normalMap) {
                obj.material.normalMap.dispose();
            }
            if (obj.material.specularMap) {
                obj.material.specularMap.dispose();
            }
            if (obj.material.envMap) {
                obj.material.envMap.dispose();
            }
            obj.material.dispose();
        }
    }

    // Recursively dispose children
    if (obj.children) {
        while (obj.children.length > 0) {
            disposeObject(obj.children[0]);
        }
    }
}

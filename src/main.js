import * as THREE from 'three';
import { SceneManager } from './sceneManager.js';

let scene, camera, renderer, container, sceneManager;

function setupThreeJs() {
    container = document.getElementById('container3D');

    renderer = new THREE.WebGLRenderer({ antialias: true });
    scene = new THREE.Scene();

    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);

    window.addEventListener('resize', onResize);
    onResize();
}

function onResize() {
    if (!container || !renderer || !camera) return;
    
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    // Actualiza la relación de aspecto de las 6 cámaras en SceneManager
    if (sceneManager && sceneManager.cameras) {
        Object.values(sceneManager.cameras).forEach(cam => {
            cam.aspect = width / height;
            cam.updateProjectionMatrix();
        });
    }
}

setupThreeJs();

// Se pasan scene, camera y renderer para habilitar los controles y cámaras dinámicas
sceneManager = new SceneManager(scene, camera, renderer);

// SceneManager inicia su propio ciclo de animación internamente
sceneManager.animate();
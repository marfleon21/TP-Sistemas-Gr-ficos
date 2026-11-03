import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class CameraManager {
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;
        this.aspect = window.innerWidth / window.innerHeight;

        // Definición de las 6 cámaras
        this.cameras = {
            1: new THREE.PerspectiveCamera(60, this.aspect, 0.1, 1000), // Orbital General
            2: new THREE.PerspectiveCamera(50, this.aspect, 0.1, 1000), // Orbital Nave
            3: new THREE.PerspectiveCamera(65, this.aspect, 0.1, 1000), // Seguimiento Grúa
            4: new THREE.PerspectiveCamera(70, this.aspect, 0.1, 1000), // Piloto
            5: new THREE.PerspectiveCamera(55, this.aspect, 0.1, 1000), // Seguimiento Nave
            6: new THREE.PerspectiveCamera(75, this.aspect, 0.1, 1000)  // Primera Persona
        };

        this.currentCamIndex = 1;
        this.activeCamera = this.cameras[1];

        // Controles de órbita
        this.orbitGeneral = new OrbitControls(this.cameras[1], renderer.domElement);
        this.orbitGeneral.target.set(0, 2, 0);

        this.orbitNave = new OrbitControls(this.cameras[2], renderer.domElement);
        this.orbitNave.target.set(0, 1, 0);

        // Controles FPS (Cámara 6)
        this.fpsControls = new PointerLockControls(this.cameras[6], document.body);
        this.moveState = { forward: false, backward: false, left: false, right: false };

        this._setupCameraPositions();
        this._setupListeners();
    }

    _setupCameraPositions() {
        // 1. Orbital Hangar
        this.cameras[1].position.set(15, 12, 20);
        this.orbitGeneral.update();

        // 2. Orbital Nave
        this.cameras[2].position.set(0, 4, 7);
        this.orbitNave.update();

        // 4. Vista de Piloto (Posición fija en el asiento de la cabina)
        this.cameras[4].position.set(0, 1.15, 0.2);
        this.cameras[4].lookAt(0, 1.0, -3.0);

        // 5. Seguimiento Nave (Detrás de la popa)
        this.cameras[5].position.set(0, 3.5, 6.0);
        this.cameras[5].lookAt(0, 1.0, -2.0);

        // 6. FPS Hangar (Altura de ojos)
        this.cameras[6].position.set(0, 1.7, 12);
    }

    setCamara(index) {
        this.currentCamIndex = parseInt(index);
        this.activeCamera = this.cameras[this.currentCamIndex];

        // Desactivar controles no vigentes
        this.orbitGeneral.enabled = (this.currentCamIndex === 1);
        this.orbitNave.enabled = (this.currentCamIndex === 2);

        if (this.currentCamIndex === 6) {
            this.fpsControls.lock();
        } else if (this.fpsControls.isLocked) {
            this.fpsControls.unlock();
        }
    }

    update(craneHookPosition) {
        // Actualizar Cámara 3 (Seguimiento de la grúa)
        if (this.currentCamIndex === 3 && craneHookPosition) {
            this.cameras[3].position.copy(craneHookPosition).add(new THREE.Vector3(2, 3, 2));
            this.cameras[3].lookAt(craneHookPosition);
        }

        // Actualizar movimiento WASD para Cámara 6 (Primera Persona)
        if (this.currentCamIndex === 6 && this.fpsControls.isLocked) {
            const speed = 0.15;
            if (this.moveState.forward) this.fpsControls.moveForward(speed);
            if (this.moveState.backward) this.fpsControls.moveForward(-speed);
            if (this.moveState.left) this.fpsControls.moveRight(-speed);
            if (this.moveState.right) this.fpsControls.moveRight(speed);
        }
    }

    _setupListeners() {
        window.addEventListener('keydown', (e) => {
            if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
                this.setCamara(e.key);
            }
            if (this.currentCamIndex === 6) {
                if (e.key === 'w' || e.key === 'W') this.moveState.forward = true;
                if (e.key === 's' || e.key === 'S') this.moveState.backward = true;
                if (e.key === 'a' || e.key === 'A') this.moveState.left = true;
                if (e.key === 'd' || e.key === 'D') this.moveState.right = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.currentCamIndex === 6) {
                if (e.key === 'w' || e.key === 'W') this.moveState.forward = false;
                if (e.key === 's' || e.key === 'S') this.moveState.backward = false;
                if (e.key === 'a' || e.key === 'A') this.moveState.left = false;
                if (e.key === 'd' || e.key === 'D') this.moveState.right = false;
            }
        });
    }
}
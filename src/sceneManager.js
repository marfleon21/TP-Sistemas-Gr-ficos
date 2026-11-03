import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { createCabinaNave } from './cabina.js';
import { createGrua } from './grua.js';
import { createHangarStructure } from './hangar.js';
import { CraneAssembler } from './ensamblador.js';

import { createAlaBarridoCurvo, createAlaMariposa, createSistemaArmas } from './alas.js';
import { createPropulsorRevolucion, createColaAguijon } from './propulsores.js';

export class SceneManager {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.previousTime = performance.now() * 0.001;

        // Iluminacion
        const light = new THREE.DirectionalLight(0xffffff, 1.2);
        light.position.set(10, 20, 10);
        this.scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x666666);
        this.scene.add(ambientLight);
        
        //hangar
        this.hangar = createHangarStructure();
        this.scene.add(this.hangar.mesh);

        const radio = 10;
        const altura = 2;
        const matOctagono = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const hangarOctagono = new THREE.Mesh(
            new THREE.CylinderGeometry(radio, radio, altura, 8),
            matOctagono
        );
        hangarOctagono.position.set(0, 0, 0);
        hangarOctagono.rotateY(Math.PI / 8);
        this.scene.add(hangarOctagono);

        // Grúa y Nave
        this.grua = createGrua();
        this.grua.mesh.position.set(0, 30.0, 0);
        this.scene.add(this.grua.mesh);

        this.naveGroup = new THREE.Group();
        this.naveGroup.position.set(0, 1.0, 0);
        this.scene.add(this.naveGroup);

        this.cabinaNave = createCabinaNave();
        this.cabina = this.cabinaNave.mesh || this.cabinaNave;
        this.cabina.position.set(0, -3, 0);
        this.naveGroup.add(this.cabina);

        this.assembler = new CraneAssembler(this.grua, this.hangar.rutaRiel, this.naveGroup, 30.0, 20.0);

        // Variantes en el piso
        this.variantesPiso = {};
        this.alasAnimadas = [];
        this._crearTodasLasVariantesEnPiso();

        this._setupCamaras();

        // menu
        this.guiConfig = {
            alas: 'Barrido Curvo',
            propulsor: 'Revolución Dual',
            camara: 1,
            generar: () => this.generarSecuencia(),
            pausar: () => { this.assembler.isPaused = !this.assembler.isPaused; },
            completar: () => this.assembler.forceComplete(),
            reiniciar: () => this.reiniciarEscena()
        };

        this._setupGUI();
        this._setupKeyboardListeners();

        this.generarSecuencia();
    }

    _crearTodasLasVariantesEnPiso() {
        const getPuntoRielPiso = (t,y) => {
            const pt = this.hangar.rutaRiel.getPointAt(t);
            return { pos: new THREE.Vector3(pt.x, y, pt.z), tParam: t };
        };

        // Puntos sobre el riel
        const pBarridoIzq   = getPuntoRielPiso(0,   0.2);
        const pBarridoDer   = getPuntoRielPiso(0,   0.2);
        const pMariposaIzq  = getPuntoRielPiso(0.1, 0);
        const pMariposaDer  = getPuntoRielPiso(0.1, 0);
        const pArmasIzq     = getPuntoRielPiso(0.2, 0);
        const pArmasDer     = getPuntoRielPiso(0.2,    0);
        const pRevolucionIzq = getPuntoRielPiso(0.85,   1.3);
        const pRevolucionDer = getPuntoRielPiso(0.9,   1.3);
        const pCola         = getPuntoRielPiso(1,   2.3);

        // Renderizo las alas
        const barridoIzq = createAlaBarridoCurvo(true);
        const barridoDer = createAlaBarridoCurvo(false);
        barridoIzq.position.copy(pBarridoIzq.pos);
        barridoDer.position.copy(pBarridoDer.pos);

        const mariposaIzq = createAlaMariposa(true);
        const mariposaDer = createAlaMariposa(false);
        mariposaIzq.position.copy(pMariposaIzq.pos);
        mariposaDer.position.copy(pMariposaDer.pos);

        const armasIzq = createSistemaArmas(true);
        const armasDer = createSistemaArmas(false);
        armasIzq.position.copy(pArmasIzq.pos);
        armasDer.position.copy(pArmasDer.pos);

        // Propulsores
        const grupoPropulsoresBase = createPropulsorRevolucion();
        
        // Separo los propulsores para ponerlos de a 1
        let revolucionIzq, revolucionDer;
        if (grupoPropulsoresBase.children && grupoPropulsoresBase.children.length >= 2) {
            revolucionIzq = grupoPropulsoresBase.children[0];
            revolucionDer = grupoPropulsoresBase.children[1];
        } else {
            // Si es un solo mesh
            revolucionIzq = grupoPropulsoresBase;
            revolucionDer = grupoPropulsoresBase.clone();
        }

        revolucionIzq.position.copy(pRevolucionIzq.pos);
        revolucionDer.position.copy(pRevolucionDer.pos);
        
        //Cola de escorpion
        const cola = createColaAguijon();
        cola.position.copy(pCola.pos);

        this.scene.add(
            barridoIzq, barridoDer, 
            mariposaIzq, mariposaDer, 
            armasIzq, armasDer, 
            revolucionIzq, revolucionDer, 
            cola
        );

        // Mapeo de las variantes con offsets
        this.variantesPiso = {
            'Barrido Curvo': [
                {
                    mesh: barridoIzq, origPos: pBarridoIzq.pos, tParam: pBarridoIzq.tParam,
                    gripOffset: new THREE.Vector3(1, -0.3, 2),
                    targetPos: new THREE.Vector3(-3, 2, 1)
                },
                {
                    mesh: barridoDer, origPos: pBarridoDer.pos, tParam: pBarridoDer.tParam,
                    gripOffset: new THREE.Vector3(-1, -0.3, 2),
                    targetPos: new THREE.Vector3(3, 2, 1)
                }
            ],
            'Mariposa': [
                {
                    mesh: mariposaIzq, origPos: pMariposaIzq.pos, tParam: pMariposaIzq.tParam,
                    gripOffset: new THREE.Vector3(0, -0.4, 0),
                    targetPos: new THREE.Vector3(-3, 2, 0.0),
                    animated: mariposaIzq
                },
                {
                    mesh: mariposaDer, origPos: pMariposaDer.pos, tParam: pMariposaDer.tParam,
                    gripOffset: new THREE.Vector3(0, -0.4, 0),
                    targetPos: new THREE.Vector3(3, 2, 0.0),
                    animated: mariposaDer
                }
            ],
            'Sistema Armas': [
                {
                    mesh: armasIzq, origPos: pArmasIzq.pos, tParam: pArmasIzq.tParam,
                    gripOffset: new THREE.Vector3(0, -0.5, 0),
                    targetPos: new THREE.Vector3(-3, 2.6, 0.0)
                },
                {
                    mesh: armasDer, origPos: pArmasDer.pos, tParam: pArmasDer.tParam,
                    gripOffset: new THREE.Vector3(0, -0.5, 0),
                    targetPos: new THREE.Vector3(3, 2.6, 0.0)
                }
            ],
            'Revolución Dual': [
                {
                    name: 'Propulsor Izquierdo',
                    mesh: revolucionIzq, origPos: pRevolucionIzq.pos, tParam: pRevolucionIzq.tParam,
                    gripOffset: new THREE.Vector3(0, -1.5, 0),
                    targetPos: new THREE.Vector3(-1.4, 2, -5.3) // Utiliza la cota interna original de propulsores.js
                },
                {
                    name: 'Propulsor Derecho',
                    mesh: revolucionDer, origPos: pRevolucionDer.pos, tParam: pRevolucionDer.tParam,
                    gripOffset: new THREE.Vector3(0, -1.5, 0),
                    targetPos: new THREE.Vector3(1.4, 2, -5.3) // Utiliza la cota interna original de propulsores.js
                }
            ],
            'Cola Escorpion': [
                {
                    name: 'Cola Escorpion',
                    mesh: cola, origPos: pCola.pos, tParam: pCola.tParam,
                    gripOffset: new THREE.Vector3(0, -4.5, 1),
                    targetPos: new THREE.Vector3(0, 2.4, -5.5)
                }
            ]
        };
    }

    _setupCamaras() {
        const aspect = window.innerWidth / window.innerHeight;

        this.cameras = {
            1: new THREE.PerspectiveCamera(60, aspect, 0.1, 1000),
            2: new THREE.PerspectiveCamera(50, aspect, 0.1, 1000),
            3: new THREE.PerspectiveCamera(65, aspect, 0.1, 1000),
            4: new THREE.PerspectiveCamera(70, aspect, 0.1, 1000),
            5: new THREE.PerspectiveCamera(55, aspect, 0.1, 1000),
            6: new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
        };

        this.cameras[1].position.set(22, 18, 28);
        this.cameras[2].position.set(0, 4, 9);
        
        this.cameras[4].position.set(0, 5.2, -1);
        this.cameras[4].lookAt(0, 4.8, 3);
        this.cameras[5].position.set(0, 8, -10);
        this.cameras[5].lookAt(0, 1, 2);
        this.cameras[6].position.set(0, 1.7, 14);

        this.orbitGeneral = new OrbitControls(this.cameras[1], this.renderer.domElement);
        this.orbitGeneral.target.set(0, 2, 0);

        this.orbitNave = new OrbitControls(this.cameras[2], this.renderer.domElement);
        this.orbitNave.target.set(0, 6, 0);

        this.fpsControls = new PointerLockControls(this.cameras[6], document.body);
        this.moveState = { W: false, S: false, A: false, D: false };

        this.currentCamIndex = 1;
        this.activeCamera = this.cameras[1];
    }

    setCamara(index) {
        this.currentCamIndex = parseInt(index);
        this.activeCamera = this.cameras[this.currentCamIndex];

        this.orbitGeneral.enabled = (this.currentCamIndex === 1);
        this.orbitNave.enabled = (this.currentCamIndex === 2);

        if (this.currentCamIndex === 6) {
            this.fpsControls.lock();
        } else if (this.fpsControls.isLocked) {
            this.fpsControls.unlock();
        }
    }
    //Controles
    _setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
                this.guiConfig.camara = parseInt(e.key);
                this.setCamara(e.key);
            }
            if (this.currentCamIndex === 6) {
                if (e.key.toLowerCase() === 'w') this.moveState.W = true;
                if (e.key.toLowerCase() === 's') this.moveState.S = true;
                if (e.key.toLowerCase() === 'a') this.moveState.A = true;
                if (e.key.toLowerCase() === 'd') this.moveState.D = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.currentCamIndex === 6) {
                if (e.key.toLowerCase() === 'w') this.moveState.W = false;
                if (e.key.toLowerCase() === 's') this.moveState.S = false;
                if (e.key.toLowerCase() === 'a') this.moveState.A = false;
                if (e.key.toLowerCase() === 'd') this.moveState.D = false;
            }
        });
    }

    //Setup del menú
    _setupGUI() {
        this.gui = new GUI({ title: 'Ensamblador Hangar' });

        const fConfig = this.gui.addFolder('Módulos');
        fConfig.add(this.guiConfig, 'alas', ['Barrido Curvo', 'Mariposa', 'Sistema Armas']).name('Alas');
        fConfig.add(this.guiConfig, 'propulsor', ['Revolución Dual', 'Cola Escorpion']).name('Propulsores');

        const fCam = this.gui.addFolder('Cámaras (Teclas 1-6)');
        fCam.add(this.guiConfig, 'camara', {
            '1. Orbital General': 1,
            '2. Orbital Nave': 2,
            '3. Seguimiento Grúa': 3,
            '4. Piloto': 4,
            '5. Seguimiento Nave': 5,
            '6. Primera Persona': 6
        }).name('Vista').onChange(v => this.setCamara(v));

        const fSeq = this.gui.addFolder('Secuencia');
        fSeq.add(this.guiConfig, 'generar').name('Generar');
        fSeq.add(this.guiConfig, 'pausar').name('Pausar / Continuar');
        fSeq.add(this.guiConfig, 'completar').name('Completar');
        fSeq.add(this.guiConfig, 'reiniciar').name('Reiniciar');
    }

    reiniciarEscena() {
        Object.keys(this.variantesPiso).forEach(key => {
            this.variantesPiso[key].forEach(item => {
                this.scene.add(item.mesh);
                item.mesh.position.copy(item.origPos);
            });
        });

        this.alasAnimadas = [];
        this.assembler.setupSequence([]);
    }

    generarSecuencia() {
        this.reiniciarEscena();

        const alasSeleccionadas = this.variantesPiso[this.guiConfig.alas];
        const propSeleccionado = this.variantesPiso[this.guiConfig.propulsor];

        this.alasAnimadas = alasSeleccionadas
            .filter(item => item.animated)
            .map(item => item.animated);

        // Arma la cola para hacer la nave
        const queue = [
            {
                name: 'Ala Izquierda',
                mesh: alasSeleccionadas[0].mesh,
                floorPos: alasSeleccionadas[0].origPos.clone(),
                gripOffset: alasSeleccionadas[0].gripOffset.clone(),
                targetPos: alasSeleccionadas[0].targetPos.clone(),
                tStart: alasSeleccionadas[0].tParam,
                tDock: 0.50
            },
            {
                name: 'Ala Derecha',
                mesh: alasSeleccionadas[1].mesh,
                floorPos: alasSeleccionadas[1].origPos.clone(),
                gripOffset: alasSeleccionadas[1].gripOffset.clone(),
                targetPos: alasSeleccionadas[1].targetPos.clone(),
                tStart: alasSeleccionadas[1].tParam,
                tDock: 0.50
            }
        ];

        // Añado propulsores de a auno
        propSeleccionado.forEach(prop => {
            queue.push({
                name: prop.name || 'Propulsor',
                mesh: prop.mesh,
                floorPos: prop.origPos.clone(),
                gripOffset: prop.gripOffset.clone(),
                targetPos: prop.targetPos.clone(),
                tStart: prop.tParam,
                tDock: 0.50
            });
        });

        this.assembler.setupSequence(queue);
    }






    //Animaciones
    animate = (currentTime = performance.now()) => {
        requestAnimationFrame(this.animate);

        const timeInSeconds = currentTime * 0.001;
        const deltaTime = timeInSeconds - this.previousTime;
        this.previousTime = timeInSeconds;

        if (isNaN(deltaTime) || deltaTime > 0.1) return;
        
        //Alas de mariposa
        if (this.alasAnimadas && this.alasAnimadas.length > 0) {
            this.alasAnimadas.forEach(ala => {
                if (ala.userData && ala.userData.update) {
                    ala.userData.update(timeInSeconds);
                }
            });
        }

        //Primera persona
        if (this.currentCamIndex === 6 && this.fpsControls.isLocked) {
            const speed = 8.0 * deltaTime;
            if (this.moveState.W) this.fpsControls.moveForward(speed);
            if (this.moveState.S) this.fpsControls.moveForward(-speed);
            if (this.moveState.A) this.fpsControls.moveRight(-speed);
            if (this.moveState.D) this.fpsControls.moveRight(speed);
        }

        //Seguimiento grúa
        if (this.currentCamIndex === 3 && this.grua) {
            const hookPos = this.grua.mesh.position.clone();
            hookPos.y -= this.assembler.currentExtension;
            this.cameras[3].position.copy(hookPos).add(new THREE.Vector3(3, 0, 3));

            const targetLookAt = hookPos.clone().sub(new THREE.Vector3(0, 12.2, 0));
            this.cameras[3].lookAt(targetLookAt);   
        }

        this.assembler.update(deltaTime);
        this.renderer.render(this.scene, this.activeCamera);
    };
}
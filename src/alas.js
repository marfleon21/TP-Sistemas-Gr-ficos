import * as THREE from 'three';

// HUD y panel de control interno
export function createPanelLuminico() {
    const panelGroup = new THREE.Group();

    const matConsola = new THREE.MeshPhongMaterial({ color: 0x1c1e22, shininess: 80 });
    const matPantallaPrincipal = new THREE.MeshPhongMaterial({
        color: 0x00ffcc,
        emissive: 0x00aa88,
        emissiveIntensity: 0.9,
        side: THREE.DoubleSide
    });
    const matIndicadorLateral = new THREE.MeshPhongMaterial({
        color: 0xff3355,
        emissive: 0xcc1133,
        emissiveIntensity: 0.8
    });

    const cuerpoConsolaGeom = new THREE.BoxGeometry(1.3, 0.45, 0.7);
    const cuerpoConsola = new THREE.Mesh(cuerpoConsolaGeom, matConsola);
    cuerpoConsola.position.set(0, 0, 0);

    const pantallaGeom = new THREE.PlaneGeometry(0.95, 0.3);
    const pantallaMain = new THREE.Mesh(pantallaGeom, matPantallaPrincipal);
    pantallaMain.position.set(0, 0.1, 0.36);

    const indIzqGeom = new THREE.BoxGeometry(0.12, 0.12, 0.05);
    const indIzq = new THREE.Mesh(indIzqGeom, matIndicadorLateral);
    indIzq.position.set(-0.5, 0.1, 0.36);

    const indDer = indIzq.clone();
    indDer.position.set(0.5, 0.1, 0.36);

    panelGroup.add(cuerpoConsola, pantallaMain, indIzq, indDer);
    panelGroup.rotation.x = -Math.PI / 6;

    return panelGroup;
}

// VARIANTE 1: ALA DE BARRIDO CURVO
export function createAlaBarridoCurvo(esIzquierda = false, opciones = {}) {
    const envergadura = opciones.envergadura || 6.0;
    const profundidadRaiz = opciones.profundidadRaiz || 3.2;
    const ladoMult = esIzquierda ? -1 : 1;
    const alaGroup = new THREE.Group();

    const matAla = new THREE.MeshPhongMaterial({
        color: 0x40454c,
        shininess: 120,
        side: THREE.DoubleSide
    });

    const perfilAla2D = new THREE.Shape();
    perfilAla2D.moveTo(0, 0);
    perfilAla2D.quadraticCurveTo(3.0 * ladoMult, -0.5, envergadura * ladoMult, -3.2);
    perfilAla2D.lineTo(envergadura * ladoMult, -3.8);
    perfilAla2D.quadraticCurveTo(2.5 * ladoMult, -2.8, 0, -profundidadRaiz);
    perfilAla2D.closePath();

    const extrudeSettings = {
        depth: 0.18,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.08,
        bevelSegments: 5
    };

    const geomAla = new THREE.ExtrudeGeometry(perfilAla2D, extrudeSettings);
    geomAla.rotateX(Math.PI / 2);
    geomAla.center();
    geomAla.translate((envergadura / 2) * ladoMult, 0, -profundidadRaiz / 2);

    const alaMesh = new THREE.Mesh(geomAla, matAla);
    alaGroup.add(alaMesh);

    const luzGeom = new THREE.BoxGeometry(0.12, 0.08, 0.6);
    const luzMat = new THREE.MeshPhongMaterial({
        color: esIzquierda ? 0xff0044 : 0x00ff88,
        emissive: esIzquierda ? 0xcc0033 : 0x00cc66,
        emissiveIntensity: 0.9
    });
    const luzPunta = new THREE.Mesh(luzGeom, luzMat);
    luzPunta.position.set(envergadura * ladoMult, 0.15, -3.2);
    alaGroup.add(luzPunta);

    alaGroup.position.z = -2;
    return alaGroup;
}

// VARIANTE 2: ALAS DE MARIPOSA ANIMADAS
export function createAlaMariposa(esIzquierda = false, opciones = {}) {
    const radioSuperior = opciones.radioSuperior || 2.2;
    const radioInferior = opciones.radioInferior || 1.4;
    const ladoMult = esIzquierda ? -1 : 1;
    const alaGroup = new THREE.Group();

    const matAla = new THREE.MeshPhongMaterial({
        color: 0x9922ee,
        emissive: 0x330066,
        transparent: true,
        opacity: 0.8,
        shininess: 100,
        side: THREE.DoubleSide
    });

    const perfilMariposa = new THREE.Shape();
    perfilMariposa.moveTo(0, 0);

    perfilMariposa.quadraticCurveTo(
        radioSuperior * 0.5, radioSuperior * 1.8,
        radioSuperior * 1.3, radioSuperior * 1.0
    );
    perfilMariposa.quadraticCurveTo(
        radioSuperior * 1.5, radioSuperior * 0.2,
        radioSuperior * 0.7, 0.0
    );
    perfilMariposa.quadraticCurveTo(
        radioSuperior * 0.4, -0.1,
        radioInferior * 0.9, -0.4
    );
    perfilMariposa.quadraticCurveTo(
        radioInferior * 1.4, -radioInferior * 1.0,
        radioInferior * 0.7, -radioInferior * 1.8
    );
    perfilMariposa.quadraticCurveTo(
        radioInferior * 0.1, -radioInferior * 1.6,
        0, -0.8
    );
    perfilMariposa.closePath();

    const extrudeSettings = {
        depth: 0.06,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 4
    };

    const geomAla = new THREE.ExtrudeGeometry(perfilMariposa, extrudeSettings);
    geomAla.rotateX(Math.PI / 2);

    const alaMesh = new THREE.Mesh(geomAla, matAla);
    alaMesh.scale.x = ladoMult;
    alaMesh.rotation.z = (Math.PI / 8) * ladoMult;
    alaGroup.add(alaMesh);

    alaGroup.userData.update = function(time) {
        const velocidadAleteo = 3.0;
        const amplitudAleteo = 0.22;
        alaGroup.rotation.z = Math.sin(time * velocidadAleteo) * amplitudAleteo * ladoMult;
    };

    alaGroup.scale.set(2, 1, 2);
    alaGroup.position.set(0, 0, -2);
    return alaGroup;
}

// VARIANTE 3: MÓDULO DE CAÑONES BLÁSTER
export function createSistemaArmas(esIzquierda = false, opciones = {}) {
    const largoCañon = opciones.largoCañon || 5.0;
    const calibre = opciones.calibre || 0.18;
    const ladoMult = esIzquierda ? -1 : 1;
    const armasGroup = new THREE.Group();

    const matSoporte = new THREE.MeshPhongMaterial({ color: 0x22252a, shininess: 80 });
    const matMetalico = new THREE.MeshPhongMaterial({ color: 0x555d66, shininess: 180 });
    const matPlazma = new THREE.MeshPhongMaterial({
        color: 0x00ffcc,
        emissive: 0x00aa88,
        emissiveIntensity: 0.95
    });

    const perfilSoporte = new THREE.Shape();
    perfilSoporte.moveTo(0, 0);
    perfilSoporte.lineTo(0.8, 0.4);
    perfilSoporte.lineTo(1.5, 1.2);
    perfilSoporte.lineTo(1.5, 2.2);
    perfilSoporte.lineTo(0.6, 1.8);
    perfilSoporte.lineTo(0, 1.2);
    perfilSoporte.closePath();

    const geomSoporte = new THREE.ExtrudeGeometry(perfilSoporte, {
        depth: 0.35,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 3
    });
    geomSoporte.rotateX(Math.PI / 2);

    const meshSoporte = new THREE.Mesh(geomSoporte, matSoporte);
    meshSoporte.position.set(0, 0.2, -1.8);
    meshSoporte.scale.set(ladoMult, 2, 1);
    armasGroup.add(meshSoporte);

    const offsetEjeX = 1.3 * ladoMult;

    const geomTubo = new THREE.CylinderGeometry(calibre, calibre, largoCañon, 16);
    geomTubo.rotateX(Math.PI / 2);

    const meshCañonSup = new THREE.Mesh(geomTubo, matMetalico);
    meshCañonSup.position.set(offsetEjeX, 0, (largoCañon / 2) - 0.5);
    armasGroup.add(meshCañonSup);

    const meshCañonInf = new THREE.Mesh(geomTubo, matMetalico);
    meshCañonInf.position.set(offsetEjeX, -0.35, (largoCañon / 2) - 1.0);
    meshCañonInf.scale.set(0.85, 0.85, 0.85);
    armasGroup.add(meshCañonInf);

    const geomEmisor = new THREE.CylinderGeometry(calibre * 0.7, calibre * 0.7, 0.4, 12);
    geomEmisor.rotateX(Math.PI / 2);

    const emisorSup = new THREE.Mesh(geomEmisor, matPlazma);
    emisorSup.position.set(offsetEjeX, 0, largoCañon - 0.4);

    const emisorInf = new THREE.Mesh(geomEmisor, matPlazma);
    emisorInf.position.set(offsetEjeX, -0.35, (largoCañon * 0.85) - 0.8);
    armasGroup.add(emisorSup, emisorInf);

    for (let i = 0; i < 3; i++) {
        const geomAnillo = new THREE.TorusGeometry(calibre * 1.2, 0.03, 8, 16);
        const anillo = new THREE.Mesh(geomAnillo, matSoporte);
        anillo.position.set(offsetEjeX, 0, 1.0 + (i * 0.8));
        armasGroup.add(anillo);
    }

    armasGroup.position.set(0, 0.4, -3);
    return armasGroup;
}
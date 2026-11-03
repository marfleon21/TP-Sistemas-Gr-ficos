import * as THREE from 'three';
import { createPanelLuminico, createSistemaArmas } from './alas.js';

import { createPropulsorRevolucion, createColaAguijon } from './propulsores.js';
export function createCabinaNave() {
    const naveGroup = new THREE.Group();

    // Materiales
    const matFuselaje = new THREE.MeshPhongMaterial({ color: 0x50555c, shininess: 170, side: THREE.DoubleSide });
    const matDetalles = new THREE.MeshPhongMaterial({ color: 0x50555c, shininess: 170 });
    const matAlmohadon = new THREE.MeshPhongMaterial({ color: 0x5C0120, shininess: 90 });

    const matVidrio = new THREE.MeshPhongMaterial({
        color: 0x88ccee,
        transparent: true,
        opacity: 0.2,
        shininess: 100,
        reflectivity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    // Perfil principal del fuselaje
    const perfilFuselaje = new THREE.Shape();
    perfilFuselaje.moveTo(0, 0.1);
    perfilFuselaje.quadraticCurveTo(1.8, 1.5, 3.8, 1.8);
    perfilFuselaje.lineTo(3.5, 0.7);
    perfilFuselaje.lineTo(7.5, 0.7);
    perfilFuselaje.lineTo(7.9, 2.8);
    perfilFuselaje.quadraticCurveTo(8.5, 2.7, 11, 2.7);
    perfilFuselaje.lineTo(11, 2.6);
    perfilFuselaje.quadraticCurveTo(9.5, 0.5, 8.5, 0);
    perfilFuselaje.quadraticCurveTo(7.5, -0.5, 4.5, -0.4);
    perfilFuselaje.quadraticCurveTo(1.8, -0.2, 0, -0.1);

    const extrudeSettingsFuselaje = {
        depth: 2.6,
        bevelEnabled: true,
        bevelThickness: 0.4,
        bevelSize: 0.4,
        bevelSegments: 20
    };

    const geomFuselaje = new THREE.ExtrudeGeometry(perfilFuselaje, extrudeSettingsFuselaje);
    geomFuselaje.center();

    const fuselajeMesh = new THREE.Mesh(geomFuselaje, matFuselaje);
    fuselajeMesh.rotation.y = Math.PI / 2;
    fuselajeMesh.scale.set(1.2, 1.1, 1.8);
    fuselajeMesh.position.set(0, 5.5, 0);
    naveGroup.add(fuselajeMesh);

    // Puertas laterales
    const perfilPuerta = new THREE.Shape();
    perfilPuerta.moveTo(3.8, 0.7);
    perfilPuerta.lineTo(4.2, 1.4);
    perfilPuerta.lineTo(7.4, 1.5);
    perfilPuerta.lineTo(7.4, 0.7);
    perfilPuerta.closePath();

    const extrudePuertaSettings = {
        depth: 0.25,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 10
    };

    const geomPuerta = new THREE.ExtrudeGeometry(perfilPuerta, extrudePuertaSettings);
    geomPuerta.center();

    const puertaIzq = new THREE.Mesh(geomPuerta, matDetalles);
    puertaIzq.scale.set(1.6, 1.9, 1.9);
    puertaIzq.position.set(-2.7, 5.8, -0.35);
    puertaIzq.rotation.y = Math.PI / 2;

    const puertaDer = new THREE.Mesh(geomPuerta, matDetalles);
    puertaDer.scale.set(1.6, 1.9, 1.9);
    puertaDer.position.set(2.72, 5.8, -0.35);
    puertaDer.rotation.y = Math.PI / 2;

    naveGroup.add(puertaIzq, puertaDer);

    // Asiento
    const asientoGroup = new THREE.Group();
    const almohadonGeom = new THREE.BoxGeometry(0.9, 0.4, 1.1);
    const matAsiento = new THREE.MeshPhongMaterial({ color: 0x111315, shininess: 30 });
    const almohadon = new THREE.Mesh(almohadonGeom, matAsiento);
    almohadon.position.set(0, 5.3, -0.8);

    const respaldoGeom = new THREE.BoxGeometry(0.85, 1.3, 0.2);
    const respaldo = new THREE.Mesh(respaldoGeom, matAsiento);
    respaldo.position.set(0, 6.0, -1.3);
    respaldo.rotation.x = -Math.PI / 12;

    const cabeceraGeom = new THREE.BoxGeometry(0.6, 0.35, 0.22);
    const cabecera = new THREE.Mesh(cabeceraGeom, matAlmohadon);
    cabecera.position.set(0, 6.7, -1.42);

    asientoGroup.add(almohadon, respaldo, cabecera);
    asientoGroup.position.set(0, 0.5, -0.5);
    naveGroup.add(asientoGroup);

    // Cupula / Vidrio
    const perfilCupula = new THREE.Shape();
    perfilCupula.moveTo(3.2, -1.1);
    perfilCupula.quadraticCurveTo(4.2, 0.1, 5.4, 0.5);
    perfilCupula.quadraticCurveTo(6.5, 0.55, 7.5, 0.35);
    perfilCupula.quadraticCurveTo(7.6, -0.4, 7.6, -1.1);
    perfilCupula.closePath();

    const extrudeSettingsCupula = {
        depth: 2.0,
        bevelEnabled: true,
        bevelThickness: 0.6,
        bevelSize: 0.4,
        bevelSegments: 15
    };

    const geomCupula = new THREE.ExtrudeGeometry(perfilCupula, extrudeSettingsCupula);
    geomCupula.center();

    const glassMesh = new THREE.Mesh(geomCupula, matVidrio);
    glassMesh.rotation.y = Math.PI / 2;
    glassMesh.scale.set(1.2, 1.1, 1.8);
    glassMesh.position.set(0, 6.5, -0.2);
    glassMesh.renderOrder = 1;
    naveGroup.add(glassMesh);

    // Panel de control
    const panelLuminico = createPanelLuminico();
    panelLuminico.scale.set(1.2, 1.2, 1.2);
    panelLuminico.position.set(0, 6.3, 1.35);
    panelLuminico.rotation.y = Math.PI;
    panelLuminico.rotation.x = Math.PI / 3;
    naveGroup.add(panelLuminico);

    // Puntos de anclaje
    const anchorAlaIzq = new THREE.Group();
    anchorAlaIzq.name = "Anchor_Ala_Izquierda";
    anchorAlaIzq.position.set(-2.5, 5.6, 0.8);

    const anchorAlaDer = new THREE.Group();
    anchorAlaDer.name = "Anchor_Ala_Derecha";
    anchorAlaDer.position.set(2.5, 5.6, 0.8);

    const anchorPropulsor = new THREE.Group();
    anchorPropulsor.name = "Anchor_Propulsor_Trasero";
    anchorPropulsor.position.set(0, 5.5, -6.5);

    naveGroup.add(anchorAlaIzq, anchorAlaDer, anchorPropulsor);

    // Instanciación de modulos
    const alaIzquierda = createSistemaArmas(true, { largoCañon: 5.2, calibre: 0.16 });
    const alaDerecha = createSistemaArmas(false, { largoCañon: 5.2, calibre: 0.16 });
    const propulsor = createColaAguijon();

    //anchorPropulsor.add(propulsor);
    //anchorAlaIzq.add(alaIzquierda);
    //anchorAlaDer.add(alaDerecha);
    //anchorPropulsor.add(propulsor);
    
    return {
        mesh: naveGroup,
        anchors: {
            wingLeft: anchorAlaIzq,
            wingRight: anchorAlaDer,
            thruster: anchorPropulsor
        },
        animatedWings: [alaIzquierda, alaDerecha]
    };
}
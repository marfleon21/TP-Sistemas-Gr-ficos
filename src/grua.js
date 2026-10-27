import * as THREE from 'three';

export function createGrua() {
    const gruaRoot = new THREE.Group();

    // Materiales
    const matBase = new THREE.MeshPhongMaterial({ color: 0x1f2421, shininess: 80 });
    const matSegmentoExterior = new THREE.MeshPhongMaterial({ color: 0x3a4042, shininess: 50 });
    const matSegmentoInterior = new THREE.MeshPhongMaterial({ color: 0x7a8288, shininess: 100 });
    const matImanPlates = new THREE.MeshPhongMaterial({ color: 0x8b0000, shininess: 90 }); // Rojo industrial
    const matImanCore = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 30 });
    const matGlow = new THREE.MeshPhongMaterial({ 
        color: 0x00d2ff, 
        emissive: 0x0077aa, 
        emissiveIntensity: 0.8 
    });

    //Base al techo
    const baseTechoGeom = new THREE.CylinderGeometry(2.2, 2.5, 0.8, 16);
    const baseTechoMesh = new THREE.Mesh(baseTechoGeom, matBase);
    baseTechoMesh.position.y = -0.4;
    gruaRoot.add(baseTechoMesh);

    // Corona para el giro
    const coronaGiratoriaGroup = new THREE.Group();
    coronaGiratoriaGroup.position.y = -0.8;
    gruaRoot.add(coronaGiratoriaGroup);

    const coronaGeom = new THREE.CylinderGeometry(1.8, 1.8, 0.4, 16);
    const coronaMesh = new THREE.Mesh(coronaGeom, matBase);
    coronaMesh.position.y = -0.2;
    coronaGiratoriaGroup.add(coronaMesh);

    //Brazo extendible en partes
    const tamanoTubo1 = 1.0;
    const largoTubo1 = 5.0;
    
    const perfil1 = new THREE.Shape();
    perfil1.moveTo(-tamanoTubo1, -tamanoTubo1);
    perfil1.lineTo(tamanoTubo1, -tamanoTubo1);
    perfil1.lineTo(tamanoTubo1, tamanoTubo1);
    perfil1.lineTo(-tamanoTubo1, tamanoTubo1);
    perfil1.closePath();

    const extrudeSettings1 = { depth: largoTubo1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 };
    const tubo1Geom = new THREE.ExtrudeGeometry(perfil1, extrudeSettings1);
    const tubo1Mesh = new THREE.Mesh(tubo1Geom, matSegmentoExterior);
    tubo1Mesh.rotation.x = Math.PI / 2; // Apunta verticalmente hacia abajo
    tubo1Mesh.position.y = -0.4;
    coronaGiratoriaGroup.add(tubo1Mesh);

    // Parte extensible
    const tramoExtensibleGroup = new THREE.Group();
    tramoExtensibleGroup.position.y = -0.4;
    coronaGiratoriaGroup.add(tramoExtensibleGroup);

    const tamanoTubo2 = 0.8; // Más angosto para que entre en el primer tubo
    const largoTubo2 = 5.5;
    
    //En retrospectiva esto era un cuadrado
    const perfil2 = new THREE.Shape();
    perfil2.moveTo(-tamanoTubo2, -tamanoTubo2);
    perfil2.lineTo(tamanoTubo2, -tamanoTubo2);
    perfil2.lineTo(tamanoTubo2, tamanoTubo2);
    perfil2.lineTo(-tamanoTubo2, tamanoTubo2);
    perfil2.closePath();

    const extrudeSettings2 = { depth: largoTubo2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03 };
    const tubo2Geom = new THREE.ExtrudeGeometry(perfil2, extrudeSettings2);
    const tubo2Mesh = new THREE.Mesh(tubo2Geom, matSegmentoInterior);
    tubo2Mesh.rotation.x = Math.PI / 2;
    tramoExtensibleGroup.add(tubo2Mesh);

    //Imann
    const cabezaImanGroup = new THREE.Group();
    cabezaImanGroup.position.y = -largoTubo2;//Va al final del brazo
    tramoExtensibleGroup.add(cabezaImanGroup);

    // Articulación 
    const articulacionGeom = new THREE.SphereGeometry(0.7, 16, 16);
    const articulacionMesh = new THREE.Mesh(articulacionGeom, matBase);
    cabezaImanGroup.add(articulacionMesh);

    // Electroiman acceleracers
    const bloqueImanGeom = new THREE.BoxGeometry(2.4, 0.8, 2.4);
    const bloqueImanMesh = new THREE.Mesh(bloqueImanGeom, matImanPlates);
    bloqueImanMesh.position.y = -0.7;
    cabezaImanGroup.add(bloqueImanMesh);

    // Circulo iman
    const nucleoGeom = new THREE.CylinderGeometry(1.0, 1.0, 0.2, 16);
    const nucleoMesh = new THREE.Mesh(nucleoGeom, matImanCore);
    nucleoMesh.position.y = -1.1;
    cabezaImanGroup.add(nucleoMesh);

    // Anillo sci fi luminoso
    const anilloGlowGeom = new THREE.TorusGeometry(0.8, 0.08, 12, 24);
    const anilloGlowMesh = new THREE.Mesh(anilloGlowGeom, matGlow);
    anilloGlowMesh.rotation.x = Math.PI / 2;
    anilloGlowMesh.position.y = -1.2;
    cabezaImanGroup.add(anilloGlowMesh);

    // Punto de anclaje para agarrar cosas 
    const payloadAnchor = new THREE.Group();
    payloadAnchor.position.y = -1.25;
    cabezaImanGroup.add(payloadAnchor);

    //Funciones de control
    return {
        mesh: gruaRoot,
        
        // Girar la grúa en Y 
        setRotation: (angulo) => {
            coronaGiratoriaGroup.rotation.y = angulo;
        },

        // Estirar el brazo
        setExtension: (distancia) => {
            
            const factorEscala = 1 + (distancia / largoTubo2);
            tubo2Mesh.scale.set(1, 1, factorEscala);
            cabezaImanGroup.position.y = -(largoTubo2 * factorEscala);
        },

        // Sujetar una pieza
        attachPayload: (objeto) => {
            payloadAnchor.add(objeto);
            objeto.position.set(0, 0, 0);
        },

        // Soltar la pieza
        detachPayload: (objeto, escena) => {
            escena.add(objeto);
            payloadAnchor.getWorldPosition(objeto.position);
        }
    };
}
import * as THREE from 'three';

export function createHangarStructure() {
    const hangarGroup = new THREE.Group();

    //  Materiales de la Estructura 
    const matPared = new THREE.MeshPhongMaterial({ color: 0x808080, side: THREE.DoubleSide, shininess: 30 });
    const matPiso = new THREE.MeshPhongMaterial({ color: 0xA0A080, side: THREE.DoubleSide, shininess: 30 });
    const matGrisMarcos = new THREE.MeshPhongMaterial({ color: 0x707070, side: THREE.DoubleSide });
    const matRiel = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 100 });

    //Habitación Base en forma de caja 
    const pIzquierda = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matPared);
    pIzquierda.rotation.y = Math.PI / 2;
    pIzquierda.position.set(-1, 0, 0);

    const pDerecha = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matPared);
    pDerecha.rotation.y = Math.PI / 2;
    pDerecha.position.set(1, 0, 0);

    const pTrasera = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matPared);
    pTrasera.rotation.z = Math.PI / 2;
    pTrasera.position.set(0, 0, 1);

    const pPiso = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matPiso);
    pPiso.rotation.x = Math.PI / 2;
    pPiso.position.set(0, -1, 0);

    const pTecho = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matPared);
    pTecho.rotation.x = Math.PI / 2;
    pTecho.position.set(0, 1, 0);

    const habitacionMesh = new THREE.Group();
    habitacionMesh.add(pIzquierda, pPiso, pDerecha, pTecho, pTrasera);

    // Puerta del hangar
    //Se hace con perforaciones sobre una forma 2d y se extruye
    const paredShape = new THREE.Shape();
    paredShape.moveTo(-1, 1);
    paredShape.lineTo(1, 1);
    paredShape.lineTo(1, -1);
    paredShape.lineTo(-1, -1);
    paredShape.closePath();

    const agujeroPath = new THREE.Path();
    const w = 0.8, h = 0.8, c = 0.2;

    agujeroPath.moveTo(-w + c, -1);
    agujeroPath.lineTo(-w, -h + c);
    agujeroPath.lineTo(-w, h - c);
    agujeroPath.lineTo(-w + c, h);
    agujeroPath.lineTo(w - c, h);
    agujeroPath.lineTo(w, h - c);
    agujeroPath.lineTo(w, -h + c);
    agujeroPath.lineTo(w - c, -1);
    agujeroPath.closePath();

    paredShape.holes.push(agujeroPath);

    const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.01, segments: 1 };
    const puertaGeom = new THREE.ExtrudeGeometry(paredShape, extrudeSettings);
    const pTraseraConPuerta = new THREE.Mesh(puertaGeom, matGrisMarcos);
    pTraseraConPuerta.position.set(0, 0, -1);

    // Agrego copias de la puerta como soportes
    const marcoIzquierdo = pTraseraConPuerta.clone();
    marcoIzquierdo.scale.set(1, 1.2, 1);
    marcoIzquierdo.position.set(0, 0.1, -0.33);

    const marcoDerecho = pTraseraConPuerta.clone();
    marcoDerecho.scale.set(1, 1.2, 1);
    marcoDerecho.position.set(0, 0.1, 0.33);

    habitacionMesh.add(pTraseraConPuerta, marcoIzquierdo, marcoDerecho);

    // Escala y posición de todo el hangar
    const escalaHangar = { x: 50, y: 15, z: 50 };
    habitacionMesh.position.set(0, 14.9, 0);
    habitacionMesh.scale.set(escalaHangar.x, escalaHangar.y, escalaHangar.z);
    hangarGroup.add(habitacionMesh);

    // Rieles en el techo
    const alturaTecho = 29.5;
    
    // Saco las coordenadas para los puntos de la curva en base a las dimensiones usadas
    const limiteX = escalaHangar.x * 0.4; 
    const fondoZ = 0;
    const frenteZ = escalaHangar.z * 0.8; 

    const puntosRiel = [
        new THREE.Vector3(-limiteX, alturaTecho, frenteZ),
        new THREE.Vector3(-limiteX, alturaTecho, fondoZ),
        new THREE.Vector3(limiteX, alturaTecho, fondoZ),
        new THREE.Vector3(limiteX, alturaTecho, frenteZ)
    ];

    const rutaRiel = new THREE.CurvePath();
    rutaRiel.add(new THREE.LineCurve3(puntosRiel[0], puntosRiel[1]));
    rutaRiel.add(new THREE.LineCurve3(puntosRiel[1], puntosRiel[2]));
    rutaRiel.add(new THREE.LineCurve3(puntosRiel[2], puntosRiel[3]));

    const rielGeom = new THREE.TubeGeometry(rutaRiel, 64, 0.3, 8, false);
    const rielMesh = new THREE.Mesh(rielGeom, matRiel);
    hangarGroup.add(rielMesh);

    return {
        mesh: hangarGroup,
        rutaRiel: rutaRiel
    };
}
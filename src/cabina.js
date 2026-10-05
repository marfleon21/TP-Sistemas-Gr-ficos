import * as THREE from 'three';


function createPataAlunizaje() {
    const pataGroup = new THREE.Group();
    const matMetalico = new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 80 });
    const matPlato = new THREE.MeshPhongMaterial({ color: 0xffffff });

    
    const radioPlato = 3.8;
    const alturaSuelo = -1.5;

    //Plato de apoyo 
    const platoGeom = new THREE.CylinderGeometry(0.5, 0.55, 0.1, 12);
    const plato = new THREE.Mesh(platoGeom, matPlato);
    plato.position.set(radioPlato, alturaSuelo, 0);

    //Brazo principal
    const brazoGeom = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8);
    const brazo = new THREE.Mesh(brazoGeom, matMetalico);
    
    brazo.position.set(-3, -0.6, 0);
    brazo.rotation.z = -Math.PI / 4; // Se inclina en diagonal hacia afuera

    //Amortiguador
    const pistonGeom = new THREE.CylinderGeometry(0.05, 0.05, 3.2, 8);
    const piston = new THREE.Mesh(pistonGeom, matMetalico);
    piston.position.set(-2.6, -0.7, 0);
    piston.rotation.z = -Math.PI / 3; // Se inclina mas que el brazo

    pataGroup.add(plato, brazo, piston);

    return pataGroup;
}

export function createCabinaNave() {
    //Fuselaje
    const puntosPerfil = [];
    const numPuntos = 14;

    for (let i = 0; i <= numPuntos; i++) {
        const t = i / numPuntos;
        const angle = t * (Math.PI * 0.75); 
        const x = Math.sin(angle) * 0.8;    
        const y = -Math.cos(angle) * 0.6;   
        puntosPerfil.push(new THREE.Vector2(x, y));
    }

    const cabinaGeom = new THREE.LatheGeometry(puntosPerfil, 32);
    const matFuselaje = new THREE.MeshPhongMaterial({ 
        color: 0xcccccc, 
        side: THREE.DoubleSide 
    });

    const cabinaMesh = new THREE.Mesh(cabinaGeom, matFuselaje);
    cabinaMesh.scale.set(5, 3, 10); 
    cabinaMesh.position.set(0, 5.5, 0);

    // Vidrio
    const puntosVidrio = [];
    const numPuntosVidrio = 8;
    const anguloInicio = Math.PI * 0.5; 
    const anguloFin = Math.PI;          

    for (let i = 0; i <= numPuntosVidrio; i++) {
        const t = i / numPuntosVidrio;
        const angle = anguloInicio + t * (anguloFin - anguloInicio);
        const x = Math.sin(angle) * 0.8;    
        const y = -Math.cos(angle) * 0.6;   
        puntosVidrio.push(new THREE.Vector2(x, y));
    }

    const vidrioGeom = new THREE.LatheGeometry(puntosVidrio, 32);
    const matVidrio = new THREE.MeshPhongMaterial({
        color: 0x88ccee,    //Azul
        transparent: true,
        opacity: 0.25,
        shininess: 100,
        reflectivity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false   
    });

    const vidrioMesh = new THREE.Mesh(vidrioGeom, matVidrio);
    vidrioMesh.scale.set(3.7, 3.5, 7.2);
    vidrioMesh.position.set(0, 6.5, 0);

    //Patas de la nave
    const patasGroup = new THREE.Group();
    const numPatas = 2;

    for (let i = 0; i < numPatas; i++) {
        const pata = createPataAlunizaje();
        const anguloRadial = (i * Math.PI * 2) / numPatas;

        //Al final se usaron de a 2 patas, pero esto permite tener 3 o 4
        pata.rotation.y = anguloRadial;
        patasGroup.add(pata);
    }


    patasGroup.scale.set(1, 1, 1);
    patasGroup.position.set(0, 4, 4.3);

    const patasClonadas = patasGroup.clone();
    patasClonadas.position.set(0, 4, -4.3);

    // Agrupado
    const naveGroup = new THREE.Group();
    naveGroup.add(cabinaMesh, vidrioMesh, patasGroup, patasClonadas);


    return naveGroup;
}
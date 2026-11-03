import * as THREE from 'three';

//Propulsores con revolucion
export function createPropulsorRevolucion(opciones = {}) {
    const escalaGlobal = opciones.escala || 1.2;
    const propulsorGroup = new THREE.Group();

    // Materiales
    const matTobera = new THREE.MeshPhongMaterial({ 
        color: 0x22252a, 
        shininess: 140,
        side: THREE.DoubleSide
    });
    const matInterior = new THREE.MeshPhongMaterial({ color: 0x111315, shininess: 180 });
    const matPlasma = new THREE.MeshPhongMaterial({
        color: 0x00d2ff,
        emissive: 0x0088cc,
        emissiveIntensity: 1.6
    });

    // Perfil de la tobera del propullsor
    const perfilPath = new THREE.Path();

    // Base 
    perfilPath.moveTo(0.6, 0.0);
    perfilPath.lineTo(1.1, 0.0);

    //Parte redonda
    perfilPath.bezierCurveTo(
        1.7, 0.4,
        1.5, 1.0,
        0.8, 1.4
    );

    // Campana
    perfilPath.bezierCurveTo(
        0.8, 1.8,
        1.3, 2.2,
        1.45, 2.5
    );

    // Borde final
    perfilPath.quadraticCurveTo(1.3, 2.55, 1.25, 2.45);

    const puntosPerfil = perfilPath.getPoints(32);

    // Conector y brillo
    const geomConectorPropulsor = new THREE.CylinderGeometry(1.2, 1.4, 0.8, 32);
    geomConectorPropulsor.rotateX(-Math.PI / 2);

    const geomTobera = new THREE.LatheGeometry(puntosPerfil, 32);
    geomTobera.rotateX(-Math.PI / 2);

    const geomNucleo = new THREE.SphereGeometry(0.7, 16, 16);

    // FUncion para hacer un propulsor rentero
    function crearUnidadPropulsor() {
        const unidadGroup = new THREE.Group();

        const conectorPropulsor = new THREE.Mesh(geomConectorPropulsor, matInterior);
        conectorPropulsor.rotation.x = -Math.PI / 6;
        conectorPropulsor.position.set(0, 0.2, 0.1);
        conectorPropulsor.scale.set(1.5, 1.5, 1.8);
        unidadGroup.add(conectorPropulsor);


        const meshTobera = new THREE.Mesh(geomTobera, matTobera);
        meshTobera.position.set(0, 0, -0.15);
        unidadGroup.add(meshTobera);

        const meshNucleo = new THREE.Mesh(geomNucleo, matPlasma);
        meshNucleo.position.set(0, 0, -1.45);
        meshNucleo.scale.set(1, 1, 1.3);
        unidadGroup.add(meshNucleo);

        return unidadGroup;
    }

    // Creo los dos
    const escalaUnidad = 0.75; 
    const offsetSeparacionX = 2.3; // Distancia lateral respecto al centro

    // Propulsor izquierdo
    const propulsorIzq = crearUnidadPropulsor();
    propulsorIzq.scale.set(escalaUnidad, escalaUnidad, escalaUnidad);
    propulsorIzq.position.set(-offsetSeparacionX, 0, 0);
    propulsorGroup.add(propulsorIzq);

    // Propulsor derecho
    const propulsorDer = crearUnidadPropulsor();
    propulsorDer.scale.set(escalaUnidad, escalaUnidad, escalaUnidad);
    propulsorDer.position.set(offsetSeparacionX, 0, 0);
    propulsorGroup.add(propulsorDer);

    // Escala y ubicacion, creo que esto al final no se usa porque se usa la funcion
    propulsorGroup.scale.set( 0.6,0.4, 0.6);
    propulsorGroup.position.set(0, -0.5, 0.5); 

    return propulsorGroup;
}












export function createColaAguijon() {
    const aguijonGroup = new THREE.Group();

    // Materiales
    const matCola = new THREE.MeshPhongMaterial({
        color: 0x1c1e22,
        specular: 0x555555,
        shininess: 90,
        side: THREE.DoubleSide,
        flatShading: true
    });
    const matPunta = new THREE.MeshPhongMaterial({
        color: 0x00d2ff,
        emissive: 0x00aacc,
        emissiveIntensity: 2.2
    });

    // Arco de 270°
    const curva = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.4, 0.4),    
        new THREE.Vector3(0, -0.65, -0.6),  
        new THREE.Vector3(0, 0.4, -1.8),   
        new THREE.Vector3(0, 1.9, -1.0),  
        new THREE.Vector3(0, 1.5, 0.3)     
    ]);

    const segmentosTubulares = 120;
    const segmentosRadiales = 24;
    const frames = curva.computeFrenetFrames(segmentosTubulares, false);

    const vertices = [];
    const indices = [];
    const uvs = [];

    const numAnillos = 7; 

    // Barrido para hacer los anillos y demas
    for (let i = 0; i <= segmentosTubulares; i++) {
        const t = i / segmentosTubulares;
        const pos = curva.getPointAt(t);
        const normal = frames.normals[i];
        const binormal = frames.binormals[i];

        // Envolvente de grosor
        let radioEnvelope;
        if (t < 0.82) {
            radioEnvelope = 0.35 * (1.0 - 0.42 * t); 
        } else if (t < 0.94) {
            // Ampolla final 
            const tVesicula = (t - 0.82) / 0.12;
            radioEnvelope = 0.20 + 0.11 * Math.sin(tVesicula * Math.PI);
        } else {
            // Cierra la aguja
            const tAguja = (t - 0.94) / 0.06;
            radioEnvelope = 0.20 * (1.0 - tAguja) + 0.01;
        }

        // Anillos jhechos con una senoidal
        const ondaAnillo = Math.sin(t * Math.PI * numAnillos * 2);
        const factorAnillo = 1.0 + 0.22 * Math.max(-0.4, ondaAnillo);

        for (let j = 0; j <= segmentosRadiales; j++) {
            const v = j / segmentosRadiales;
            const theta = v * Math.PI * 2;

            const crestaDorsal = 0.18 * Math.cos(theta);
            const aristasAcorazadas = 0.12 * Math.cos(4 * theta);
            
            const radioFinal = radioEnvelope * factorAnillo * (1.0 + crestaDorsal + aristasAcorazadas);

            const cx = Math.cos(theta) * radioFinal * 1.2; 
            const cy = Math.sin(theta) * radioFinal;

            const vertice = new THREE.Vector3()
                .copy(pos)
                .add(normal.clone().multiplyScalar(cx))
                .add(binormal.clone().multiplyScalar(cy));

            vertices.push(vertice.x, vertice.y, vertice.z);
            uvs.push(t, v);
        }
    }

    // armo las caras
    for (let i = 0; i < segmentosTubulares; i++) {
        for (let j = 0; j < segmentosRadiales; j++) {
            const a = i * (segmentosRadiales + 1) + j;
            const b = i * (segmentosRadiales + 1) + (j + 1);
            const c = (i + 1) * (segmentosRadiales + 1) + j;
            const d = (i + 1) * (segmentosRadiales + 1) + (j + 1);

            indices.push(a, b, d);
            indices.push(a, d, c);
        }
    }

    const geometriaBarrido = new THREE.BufferGeometry();
    geometriaBarrido.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometriaBarrido.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometriaBarrido.setIndex(indices);
    geometriaBarrido.computeVertexNormals();

    const meshCola = new THREE.Mesh(geometriaBarrido, matCola);
    aguijonGroup.add(meshCola);

    // Punta brillante 
    const geomPunta = new THREE.ConeGeometry(0.06, 0.45, 12);
    geomPunta.rotateX(Math.PI / 2); 

    const meshPunta = new THREE.Mesh(geomPunta, matPunta);

    const posFinal = curva.getPointAt(1.0);
    const tangenteFinal = curva.getTangentAt(1.0).normalize();

    meshPunta.position.copy(posFinal);
    meshPunta.lookAt(posFinal.clone().add(tangenteFinal));

    aguijonGroup.add(meshPunta);
    
    //De nuevo, estas transformaciones puede que no se usen al final
    //La escala si es necesaria
    aguijonGroup.rotation.set(-Math.PI/16,0,0)
    aguijonGroup.position.set(0,0.2,0.3)
    //aguijonGroup.position.set(0,0.2,0.3)
    aguijonGroup.scale.set(2,2,2)
    return aguijonGroup;
}
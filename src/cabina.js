import * as THREE from 'three';

function createPanelLuminico() {
    const panelGroup = new THREE.Group();

    // Materiales del tablero y la interfaz lumínica
    const matConsola = new THREE.MeshPhongMaterial({ color: 0x1c1e22, shininess: 80 });
    const matPantallaPrincipal = new THREE.MeshPhongMaterial({color: 0x00ffcc,emissive: 0x00aa88,emissiveIntensity: 0.9,side: THREE.DoubleSide});
    const matIndicadorLateral = new THREE.MeshPhongMaterial({color: 0xff3355,emissive: 0xcc1133,emissiveIntensity: 0.8});

    // Consola
    const cuerpoConsolaGeom = new THREE.BoxGeometry(1.3, 0.45, 0.7);
    const cuerpoConsola = new THREE.Mesh(cuerpoConsolaGeom, matConsola);
    cuerpoConsola.position.set(0, 0, 0);

    // Pantalla del hud
    const pantallaGeom = new THREE.PlaneGeometry(0.95, 0.3);
    const pantallaMain = new THREE.Mesh(pantallaGeom, matPantallaPrincipal);
    pantallaMain.position.set(0, 0.1, 0.36); //Sobresale un poquito al piloto

    // Puntitos rojos tipo indicador de peligro
    const indIzqGeom = new THREE.BoxGeometry(0.12, 0.12, 0.05);
    const indIzq = new THREE.Mesh(indIzqGeom, matIndicadorLateral);
    indIzq.position.set(-0.5, 0.1, 0.36);

    const indDer = indIzq.clone();
    indDer.position.set(0.5, 0.1, 0.36);

    panelGroup.add(cuerpoConsola, pantallaMain, indIzq, indDer);
    
    // Inclinado hacia el piloto
    panelGroup.rotation.x = -Math.PI / 6;

    return panelGroup;
}

export function createCabinaNave() {
    const naveGroup = new THREE.Group();

    // Materiales
    const matFuselaje = new THREE.MeshPhongMaterial({ color: 0x50555c, shininess: 70,side: THREE.DoubleSide});
    const matDetalles = new THREE.MeshPhongMaterial({color: 0x505550,shininess: 90});
    const matAlmohadon = new THREE.MeshPhongMaterial({color: 0x5C0120,shininess: 90});

    const matVidrio = new THREE.MeshPhongMaterial({
        color: 0x88ccee,       // Azul transparente 
        transparent: true,
        opacity: 0.2,
        shininess: 100,
        reflectivity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    //Fuselaje

    const perfilFuselaje = new THREE.Shape();
    //Frente
    perfilFuselaje.moveTo(0, 0.1);         // punto frontal superior
    perfilFuselaje.lineTo(3.2, 1.7);       // Esquina frontal de la cabina
    
    // Hendidura
    perfilFuselaje.lineTo(3.5, 0.7);       //Parte delantera inferior de la hendidura
    perfilFuselaje.lineTo(7.5, 0.7);       // trasera superior hendidura
    perfilFuselaje.lineTo(7.7, 2.6);       // Pared trasera de la cabina
    
    perfilFuselaje.lineTo(9.0, 1.6);       // Caida trasera
    perfilFuselaje.lineTo(9.5, -0.2);      // Cola 
    perfilFuselaje.lineTo(4.5, -0.4);      // Panza
    perfilFuselaje.lineTo(0, -0.1);        // Cierre de la punta
    perfilFuselaje.closePath();

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

    //Puertas de la cabina
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

    // Puerta Izquierda 
    const puertaIzq = new THREE.Mesh(geomPuerta, matDetalles);
    
    puertaIzq.scale.set(1.6, 1.9, 1.8);
    puertaIzq.position.set(-2.7, 5.9, -0.55);
    puertaIzq.rotation.y = Math.PI / 2;

    // Puerta Derecha 
    const puertaDer = new THREE.Mesh(geomPuerta, matDetalles);

    puertaDer.scale.set(1.6, 1.9, 1.8);
    puertaDer.position.set(2.72, 5.9, -0.55);
    puertaDer.rotation.y = Math.PI / 2;

    naveGroup.add(puertaIzq, puertaDer);

    //Asiento
    const asientoGroup = new THREE.Group();

    // Base del asiento
    const almohadonGeom = new THREE.BoxGeometry(0.9, 0.4, 1.1);
    const matAsiento = new THREE.MeshPhongMaterial({ color: 0x111315, shininess: 30 });
    const almohadon = new THREE.Mesh(almohadonGeom, matAsiento);
    almohadon.position.set(0, 5.3, -0.8);

    // Respaldo inclinado
    const respaldoGeom = new THREE.BoxGeometry(0.85, 1.3, 0.2);
    const respaldo = new THREE.Mesh(respaldoGeom, matAsiento);
    respaldo.position.set(0, 6.0, -1.3);
    respaldo.rotation.x = -Math.PI / 12; 

    // Cabecera
    const cabeceraGeom = new THREE.BoxGeometry(0.6, 0.35, 0.22);
    const cabecera = new THREE.Mesh(cabeceraGeom, matAlmohadon);
    cabecera.position.set(0, 6.7, -1.42);

    asientoGroup.add(almohadon, respaldo, cabecera);
    asientoGroup.scale.set(1,1,1);
    asientoGroup.position.set(0.,0.5,-0.5);


    naveGroup.add(asientoGroup);

    //Vidrio en cupula
    const perfilCupula = new THREE.Shape();
    perfilCupula.moveTo(2.8, -1.1);     //Frente total
    perfilCupula.lineTo(5.4, 0.5);    // punto alto del frente
    perfilCupula.lineTo(7.5, 0.35);    // parte de atras del techo
    perfilCupula.lineTo(7.6, -1.1);    // Caida trasera
    perfilCupula.closePath();

    const extrudeSettingsCupula = {
        depth: 2.0,
        bevelEnabled: true,
        bevelThickness: 0.6,
        bevelSize: 0.4,
        bevelSegments: 10
    };

    const geomCupula = new THREE.ExtrudeGeometry(perfilCupula, extrudeSettingsCupula);
    geomCupula.center();

    const glassMesh = new THREE.Mesh(geomCupula, matVidrio);
    glassMesh.rotation.y = Math.PI / 2;
    glassMesh.scale.set(1.2, 1.1, 1.8);
    glassMesh.position.set(0, 6.5, 0);
    glassMesh.renderOrder = 1;

    naveGroup.add(glassMesh);

    //Panel luminico
    const panelLuminico = createPanelLuminico();
    
    panelLuminico.scale.set(1.2, 1.2, 1.2);
    panelLuminico.position.set(0, 6.3, 1.35); 
    panelLuminico.rotation.y = Math.PI;
    panelLuminico.rotation.x = Math.PI/3;
    naveGroup.add(panelLuminico);

    return {
        mesh: naveGroup
    };
}
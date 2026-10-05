import * as THREE from 'three';
import { createCabinaNave } from './cabina.js';




export class SceneManager {
	constructor(scene) {
		const light = new THREE.DirectionalLight(0xffffff, 1);

		light.position.set(1, 1, 1);
		scene.add(light);

		const ambientLight = new THREE.AmbientLight(0x666666);
		scene.add(ambientLight);

		const grid = new THREE.GridHelper(60, 60);
		scene.add(grid);

		const axes = new THREE.AxesHelper(3);
		scene.add(axes);


		//Seccion de habitación
		const mat = new THREE.MeshPhongMaterial({ color: 0x808080, side: THREE.DoubleSide , shininess: 30});

		
		const pIzquierda = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
		pIzquierda.rotation.y = Math.PI / 2;
		pIzquierda.position.set(-1, 0, 0);

		const pDerecha = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
		pDerecha.rotation.y = Math.PI / 2;
		pDerecha.position.set(1, 0, 0);

		const pTrasera = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
		pTrasera.rotation.z = Math.PI / 2;
		pTrasera.position.set(0, 0, 1);

		const pPiso = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
		pPiso.rotation.x = Math.PI / 2;
		pPiso.position.set(0, -1, 0);

		const pTecho = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
		pTecho.rotation.x = Math.PI / 2;
		pTecho.position.set(0, 1, 0);


	
		const habitacion = new THREE.Group();
		habitacion.add(pIzquierda, pPiso, pDerecha, pTecho, pTrasera);

		habitacion.position.set(0, 14.9, 0);
		habitacion.scale.set(30, 15, 30);  



		//Agrego el marco
		
		const paredShape = new THREE.Shape();
		paredShape.moveTo(-1, 1);
		paredShape.lineTo(1, 1);
		paredShape.lineTo(1, -1);
		paredShape.lineTo(-1, -1);
		paredShape.closePath();

		//Agrego el agujero
		const agujeroPath = new THREE.Path();
		const w = 0.8, h = 0.8, c = 0.2; // c es tamaño de las esquinas

		agujeroPath.moveTo(-w+c, -1);
		agujeroPath.lineTo(-w, -h + c);						          // Esquina inferior izquierda (rasante al piso)
		agujeroPath.lineTo(-w, h - c);          // Pared izquierda sube
		agujeroPath.lineTo(-w + c, h);          // Chaflán superior izquierdo
		agujeroPath.lineTo(w - c, h);           // Dintel superior
		agujeroPath.lineTo(w, h - c); 			// Chaflán superior derecho
		agujeroPath.lineTo(w, -h + c); 
		agujeroPath.lineTo(w-c, -1);              // Pared derecha baja hasta el piso
		agujeroPath.closePath();                // Cierra la base en el piso (-w, -1) -> (w, -1)

		paredShape.holes.push(agujeroPath);


		const extrudeSettings = { depth: 0.1, bevelEnabled: true,bevelThickness: 0.02, bevelSize: 0.01, segments: 1 };

		const puertaGeom = new THREE.ExtrudeGeometry(paredShape, extrudeSettings);
		const matGris = new THREE.MeshPhongMaterial({ color: 0x808080, side: THREE.DoubleSide });
		const pTraseraConPuerta = new THREE.Mesh(puertaGeom, matGris);

		pTraseraConPuerta.position.set(0, 0, -1); 

		habitacion.add(pIzquierda, pPiso, pDerecha, pTecho, pTraseraConPuerta); // <- Usamos la nueva pared perforada

		
		habitacion.position.set(0, 14.9, 0);
		habitacion.scale.set(30, 15, 30); 

		scene.add(habitacion);

		

		//Plataforma
		const radio = 10;       
		const altura = 2;    
		const matOctagono = new THREE.MeshPhongMaterial({ color: 0x333333 });

		const hangarOctagono = new THREE.Mesh(
			new THREE.CylinderGeometry(radio, radio, altura, 8), 
			matOctagono
		);


		hangarOctagono.position.set(0, -1+ (altura / 2), 0);
		hangarOctagono.rotateY(Math.PI/(8))


		scene.add(hangarOctagono);

		//Cabina
		this.cabina = createCabinaNave();

		
		this.cabina.position.set(0, -1.5, 0);

		scene.add(this.cabina);
	}

	/*animate() {
		requestAnimationFrame(this.animate);

        // Mover/Rotar la nave
        if (this.nave) {
            this.nave.rotation.y += 0.001;
        }

		torus.rotation.x += 0.01;
		torus.rotation.y += 0.01;
	}*/

	animate = () => {
        requestAnimationFrame(this.animate);

        // Rotación de la cabina
        if (this.cabina) {
            this.cabina.rotation.y += 0.00001;
        }

    };
}


import * as THREE from 'three';
import { createCabinaNave } from './cabina.js';
import { createGrua } from './grua.js';
import { createHangarStructure } from './hangar.js';


export class SceneManager {
	constructor(scene) {
		const light = new THREE.DirectionalLight(0xffffff, 1);

		light.position.set(1, 1, 1);
		scene.add(light);

		const ambientLight = new THREE.AmbientLight(0x666666);
		scene.add(ambientLight);

		//const grid = new THREE.GridHelper(60, 60);
		//scene.add(grid);

		const axes = new THREE.AxesHelper(3);
		scene.add(axes);

		//hangar
		this.hangar = createHangarStructure();
        scene.add(this.hangar.mesh);
		

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
		this.cabinaNave = createCabinaNave();
		this.cabina = this.cabinaNave.mesh; // Mantiene la referencia al objeto 
		this.cabina.position.set(0, -1.5, 0);
		scene.add(this.cabina);


		//Grua

		this.grua = createGrua();
		this.grua.mesh.position.set(0, 30, 0); 
        scene.add(this.grua.mesh);
		

		//Sliders
		this.sliderRiel = document.getElementById('sliderRiel');
        this.sliderExt = document.getElementById('sliderExt');
	}


	animate = (currentTime = performance.now()) => {
        requestAnimationFrame(this.animate);

        const timeInSeconds = currentTime * 0.001;
        const deltaTime = timeInSeconds - this.previousTime;
        this.previousTime = timeInSeconds;

        // Evito saltos en el renderizado
        if (isNaN(deltaTime) || deltaTime > 0.1) return;

        if (isNaN(deltaTime) || deltaTime > 0.1) return;

		
		if (this.cabina) {
            //this.cabina.rotation.y += 0.2 * deltaTime;
        }

		if (this.grua && this.sliderRiel && this.sliderExt) {
					const valorRuta = parseFloat(this.sliderRiel.value);
					// La posicion viene dada por el punto de la ruta del riel
					const posicionActual = this.hangar.rutaRiel.getPointAt(valorRuta);
					this.grua.mesh.position.copy(posicionActual);

					const valorExtension = parseFloat(this.sliderExt.value);
					this.grua.setExtension(valorExtension);
		}

    };
}


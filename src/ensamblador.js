import * as THREE from 'three';

export class CraneAssembler {
    constructor(gruaObj, rutaRiel, naveGroup, Y_TECHO = 30.0, Y_TRANSITO = 20.0) {
        //Inicializo la grua
        this.gruaObj = gruaObj;
        this.gruaMesh = gruaObj.mesh;
        this.rutaRiel = rutaRiel;
        this.naveGroup = naveGroup;
        this.Y_TECHO = Y_TECHO;
        this.Y_TRANSITO = Y_TRANSITO;

        //Lista de piezas a armar
        this.queue = [];
        this.currentPartIndex = 0;
        this.assemblyState = 'IDLE';
        this.isPaused = false;

        this.currentTParam = 0.5;
        this.OFFSET_ESTATICO_GRUA = 7.55; 
        this.currentExtension = 0;
    }

    //Recibe el orden de piezas, reinicia el indice y resetea la maquina de estados
    setupSequence(queue) {
        this.queue = queue;
        this.currentPartIndex = 0;
        this.assemblyState = 'MOVE_OVER';
        this.isPaused = false;
    }

    getExtensionForY(yTarget) {
        const distanciaTotal = this.Y_TECHO - yTarget;
        const extensionNeta = distanciaTotal - this.OFFSET_ESTATICO_GRUA;
        return Math.max(0.0, extensionNeta);
    }

    //Maquina de estados, cambio estados con un switch
    update(delta) {
        if (this.isPaused || !this.queue.length) return;

        const speedT = 1.8 * delta;
        const extSpeed = 8.0 * delta;
        //No pasa nada
        if (this.currentPartIndex >= this.queue.length) {
            const targetExt = this.getExtensionForY(this.Y_TRANSITO);
            this.currentExtension = THREE.MathUtils.lerp(this.currentExtension, targetExt, extSpeed);
            if (this.gruaObj.setExtension) this.gruaObj.setExtension(this.currentExtension);
            this.assemblyState = 'IDLE';
            return;
        }

        const activePart = this.queue[this.currentPartIndex];

        switch (this.assemblyState) {
            case 'MOVE_OVER': {
                // Movimiento por el riel hacia la pieza
                this.currentTParam = THREE.MathUtils.lerp(this.currentTParam, activePart.tStart, speedT);
                const posRiel = this.rutaRiel.getPointAt(this.currentTParam);
                this.gruaMesh.position.set(posRiel.x, this.Y_TECHO, posRiel.z);

                const targetExt = this.getExtensionForY(this.Y_TRANSITO);
                this.currentExtension = THREE.MathUtils.lerp(this.currentExtension, targetExt, extSpeed);
                if (this.gruaObj.setExtension) this.gruaObj.setExtension(this.currentExtension);

                if (Math.abs(this.currentTParam - activePart.tStart) < 0.02) {
                    this.assemblyState = 'LOWER_GRIP';
                }
                break;
            }

            case 'LOWER_GRIP': {
                //Está bajando para agarrar una pieza
                const targetExt = this.getExtensionForY(activePart.floorPos.y + 0.3);
                this.currentExtension = THREE.MathUtils.lerp(this.currentExtension, targetExt, extSpeed);
                if (this.gruaObj.setExtension) this.gruaObj.setExtension(this.currentExtension);

                if (Math.abs(this.currentExtension - targetExt) < 0.15) {
                    //Acopla al anchor y pone un offset
                    if (this.gruaObj.payloadAnchor) {
                        this.gruaObj.payloadAnchor.add(activePart.mesh);
                    } else if (this.gruaObj.attachPayload) {
                        this.gruaObj.attachPayload(activePart.mesh);
                    }
                    
                    const grip = activePart.gripOffset || new THREE.Vector3(0, 0, 0);
                    activePart.mesh.position.copy(grip);
                    activePart.mesh.rotation.set(0, 0, 0);

                    this.assemblyState = 'LIFT_SAFE';
                }
                break;
            }

            case 'LIFT_SAFE': {
                // Sube la pieza para moverla
                const targetExt = this.getExtensionForY(this.Y_TRANSITO);
                this.currentExtension = THREE.MathUtils.lerp(this.currentExtension, targetExt, extSpeed);
                if (this.gruaObj.setExtension) this.gruaObj.setExtension(this.currentExtension);

                if (Math.abs(this.currentExtension - targetExt) < 0.15) {
                    this.assemblyState = 'MOVE_DOCK';
                }
                break;
            }

            case 'MOVE_DOCK': {
                // movimiento hacia la nave con la pieza
                //Modificar para que ponga las peiza en el lugar correcto
                this.currentTParam = THREE.MathUtils.lerp(this.currentTParam, activePart.tDock, speedT);
                const posRiel = this.rutaRiel.getPointAt(this.currentTParam);
                this.gruaMesh.position.set(posRiel.x, this.Y_TECHO, posRiel.z);

                const targetExt = this.getExtensionForY(this.Y_TRANSITO);
                this.currentExtension = THREE.MathUtils.lerp(this.currentExtension, targetExt, extSpeed);
                if (this.gruaObj.setExtension) this.gruaObj.setExtension(this.currentExtension);

                if (Math.abs(this.currentTParam - activePart.tDock) < 0.02) {
                    this.assemblyState = 'LOWER_DOCK';
                }
                break;
            }

            case 'LOWER_DOCK': {
                // Bajando la pieza
                const yWorldTarget = 1.0 + activePart.targetPos.y + 0.8;
                const targetExt = this.getExtensionForY(yWorldTarget);

                this.currentExtension = THREE.MathUtils.lerp(this.currentExtension, targetExt, extSpeed);
                if (this.gruaObj.setExtension) this.gruaObj.setExtension(this.currentExtension);

                if (Math.abs(this.currentExtension - targetExt) < 0.15) {
                    this.assemblyState = 'RELEASE';
                }
                break;
            }

            case 'RELEASE': {
                // Suelta la pieza y se la añade a la nace
                this.naveGroup.add(activePart.mesh);
                activePart.mesh.position.copy(activePart.targetPos);
                activePart.mesh.rotation.set(0, 0, 0);

                const targetExt = this.getExtensionForY(this.Y_TRANSITO);
                this.currentExtension = THREE.MathUtils.lerp(this.currentExtension, targetExt, extSpeed);
                if (this.gruaObj.setExtension) this.gruaObj.setExtension(this.currentExtension);

                if (Math.abs(this.currentExtension - targetExt) < 0.2) {
                    this.currentPartIndex++;
                    if (this.currentPartIndex < this.queue.length) {
                        this.assemblyState = 'MOVE_OVER';
                    } else {
                        this.assemblyState = 'IDLE';
                    }
                }
                break;
            }
        }
    }

    //Boton para la interfaz para no esperar
    forceComplete() {
        while (this.currentPartIndex < this.queue.length) {
            const part = this.queue[this.currentPartIndex];
            this.naveGroup.add(part.mesh);
            part.mesh.position.copy(part.targetPos);
            this.currentPartIndex++;
        }
        this.assemblyState = 'IDLE';
    }
}
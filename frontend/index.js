import { backend } from "declarations/backend";

class ElectromagneticFieldVisualizer {
    constructor() {
        this.initializeScene()
            .then(() => {
                this.setupGUI();
                this.createCharges();
                this.createFieldLines();
                this.animate();
                window.addEventListener('resize', () => this.onWindowResize(), false);
            })
            .catch(error => {
                console.error('Initialization error:', error);
                document.getElementById('error-message').style.display = 'block';
            });
    }

    async initializeScene() {
        try {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            
            const container = document.getElementById('container');
            if (!container) throw new Error('Container element not found');
            container.appendChild(this.renderer.domElement);

            this.camera.position.z = 10;
            
            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);

            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(0, 1, 1);
            this.scene.add(directionalLight);

            // Add grid helper
            const gridHelper = new THREE.GridHelper(20, 20);
            this.scene.add(gridHelper);

            // Initialize controls
            if (typeof THREE.OrbitControls === 'undefined') {
                throw new Error('OrbitControls not loaded');
            }
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;

            this.params = {
                charge1Strength: 1,
                charge2Strength: -1,
                charge1X: -2,
                charge1Y: 0,
                charge1Z: 0,
                charge2X: 2,
                charge2Y: 0,
                charge2Z: 0,
                fieldDensity: 5
            };

        } catch (error) {
            console.error('Scene initialization error:', error);
            throw error;
        }
    }

    setupGUI() {
        try {
            const gui = new dat.GUI();
            
            const charge1Folder = gui.addFolder('Charge 1');
            charge1Folder.add(this.params, 'charge1Strength', -5, 5).onChange(() => this.updateField());
            charge1Folder.add(this.params, 'charge1X', -5, 5).onChange(() => this.updateField());
            charge1Folder.add(this.params, 'charge1Y', -5, 5).onChange(() => this.updateField());
            charge1Folder.add(this.params, 'charge1Z', -5, 5).onChange(() => this.updateField());
            
            const charge2Folder = gui.addFolder('Charge 2');
            charge2Folder.add(this.params, 'charge2Strength', -5, 5).onChange(() => this.updateField());
            charge2Folder.add(this.params, 'charge2X', -5, 5).onChange(() => this.updateField());
            charge2Folder.add(this.params, 'charge2Y', -5, 5).onChange(() => this.updateField());
            charge2Folder.add(this.params, 'charge2Z', -5, 5).onChange(() => this.updateField());
            
            gui.add(this.params, 'fieldDensity', 2, 10, 1).onChange(() => this.updateField());
        } catch (error) {
            console.error('GUI setup error:', error);
        }
    }

    createCharges() {
        try {
            const charge1Geometry = new THREE.SphereGeometry(0.2, 32, 32);
            const charge2Geometry = new THREE.SphereGeometry(0.2, 32, 32);
            
            const charge1Material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            const charge2Material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
            
            this.charge1 = new THREE.Mesh(charge1Geometry, charge1Material);
            this.charge2 = new THREE.Mesh(charge2Geometry, charge2Material);
            
            this.updateChargePositions();
            
            this.scene.add(this.charge1);
            this.scene.add(this.charge2);
        } catch (error) {
            console.error('Error creating charges:', error);
        }
    }

    async createFieldLines() {
        const loading = document.getElementById('loading');
        loading.style.display = 'block';

        try {
            const fieldData = await backend.calculateField(
                this.params.charge1Strength,
                this.params.charge2Strength,
                [this.params.charge1X, this.params.charge1Y, this.params.charge1Z],
                [this.params.charge2X, this.params.charge2Y, this.params.charge2Z],
                this.params.fieldDensity
            );

            if (this.fieldLines) {
                this.fieldLines.forEach(line => this.scene.remove(line));
            }
            this.fieldLines = [];

            fieldData.forEach(point => {
                const arrowHelper = this.createArrow(
                    new THREE.Vector3(point.position[0], point.position[1], point.position[2]),
                    new THREE.Vector3(point.direction[0], point.direction[1], point.direction[2]),
                    point.magnitude
                );
                this.scene.add(arrowHelper);
                this.fieldLines.push(arrowHelper);
            });
        } catch (error) {
            console.error('Error calculating field:', error);
        } finally {
            loading.style.display = 'none';
        }
    }

    createArrow(position, direction, magnitude) {
        try {
            const length = Math.min(Math.abs(magnitude) * 0.5, 2.0);
            const hex = magnitude > 0 ? 0xff0000 : 0x0000ff;
            direction.normalize();
            return new THREE.ArrowHelper(direction, position, length, hex, 0.2, 0.1);
        } catch (error) {
            console.error('Error creating arrow:', error);
            return null;
        }
    }

    updateChargePositions() {
        try {
            this.charge1.position.set(this.params.charge1X, this.params.charge1Y, this.params.charge1Z);
            this.charge2.position.set(this.params.charge2X, this.params.charge2Y, this.params.charge2Z);
        } catch (error) {
            console.error('Error updating charge positions:', error);
        }
    }

    async updateField() {
        try {
            this.updateChargePositions();
            await this.createFieldLines();
        } catch (error) {
            console.error('Error updating field:', error);
        }
    }

    onWindowResize() {
        try {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        } catch (error) {
            console.error('Error resizing window:', error);
        }
    }

    animate() {
        try {
            requestAnimationFrame(() => this.animate());
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('Animation error:', error);
        }
    }
}

window.addEventListener('load', () => {
    try {
        new ElectromagneticFieldVisualizer();
    } catch (error) {
        console.error('Failed to initialize visualizer:', error);
        document.getElementById('error-message').style.display = 'block';
    }
});

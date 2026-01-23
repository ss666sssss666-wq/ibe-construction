// ==========================================
// THREE.JS BIM 3D MODEL
// ==========================================

// Wait for DOM and Three.js to load
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(15, 12, 15);
    camera.lookAt(0, 5, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xcc9461, 0.3);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);

    // Materials
    const concreteMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a2f4b,
        roughness: 0.8,
        metalness: 0.2
    });

    const cvcMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc9461,
        roughness: 0.4,
        metalness: 0.6,
        emissive: 0xcc9461,
        emissiveIntensity: 0.1
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.9,
        thickness: 0.5
    });

    const slabMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4d4d4,
        roughness: 0.7,
        metalness: 0.1
    });

    // Building Group
    const building = new THREE.Group();

    // Ground floor slab
    const groundSlab = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.3, 8),
        slabMaterial
    );
    groundSlab.position.y = 0;
    groundSlab.castShadow = true;
    groundSlab.receiveShadow = true;
    building.add(groundSlab);

    // Create columns (4 corners + center)
    const columnPositions = [
        [-5, 0, -3], [5, 0, -3], [-5, 0, 3], [5, 0, 3], [0, 0, 0]
    ];

    columnPositions.forEach(pos => {
        // Ground to R+1
        const column1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 3, 0.4),
            concreteMaterial
        );
        column1.position.set(pos[0], pos[1] + 1.5, pos[2]);
        column1.castShadow = true;
        building.add(column1);

        // R+1 to R+2
        const column2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 3, 0.4),
            concreteMaterial
        );
        column2.position.set(pos[0], pos[1] + 4.5, pos[2]);
        column2.castShadow = true;
        building.add(column2);

        // R+2 to R+3
        const column3 = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 3, 0.4),
            concreteMaterial
        );
        column3.position.set(pos[0], pos[1] + 7.5, pos[2]);
        column3.castShadow = true;
        building.add(column3);
    });

    // Floor slabs
    [3, 6, 9].forEach(height => {
        const slab = new THREE.Mesh(
            new THREE.BoxGeometry(12, 0.3, 8),
            slabMaterial
        );
        slab.position.y = height;
        slab.castShadow = true;
        slab.receiveShadow = true;
        building.add(slab);
    });

    // Beams (horizontal structural elements)
    const beamPositions = [
        // Front beams
        [[-5, 3, -3], [5, 3, -3]],
        [[-5, 6, -3], [5, 6, -3]],
        [[-5, 9, -3], [5, 9, -3]],
        // Back beams
        [[-5, 3, 3], [5, 3, 3]],
        [[-5, 6, 3], [5, 6, 3]],
        [[-5, 9, 3], [5, 9, 3]],
        // Side beams
        [[-5, 3, -3], [-5, 3, 3]],
        [[5, 3, -3], [5, 3, 3]],
        [[-5, 6, -3], [-5, 6, 3]],
        [[5, 6, -3], [5, 6, 3]],
        [[-5, 9, -3], [-5, 9, 3]],
        [[5, 9, -3], [5, 9, 3]]
    ];

    beamPositions.forEach(([start, end]) => {
        const length = Math.sqrt(
            Math.pow(end[0] - start[0], 2) +
            Math.pow(end[2] - start[2], 2)
        );
        const beam = new THREE.Mesh(
            new THREE.BoxGeometry(length, 0.3, 0.3),
            concreteMaterial
        );
        beam.position.set(
            (start[0] + end[0]) / 2,
            start[1],
            (start[2] + end[2]) / 2
        );
        if (start[2] !== end[2]) {
            beam.rotation.y = Math.PI / 2;
        }
        beam.castShadow = true;
        building.add(beam);
    });

    // CVC Ducts (Bronze)
    [1.5, 4.5, 7.5].forEach(height => {
        const duct = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 10, 8),
            cvcMaterial
        );
        duct.position.set(0, height, 0);
        duct.rotation.z = Math.PI / 2;
        building.add(duct);

        // Vertical risers
        const riser1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 3, 8),
            cvcMaterial
        );
        riser1.position.set(-3, height, 0);
        building.add(riser1);

        const riser2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 3, 8),
            cvcMaterial
        );
        riser2.position.set(3, height, 0);
        building.add(riser2);
    });

    // Glass facade
    const glassPanels = [
        // Front panels
        new THREE.Mesh(new THREE.BoxGeometry(5, 2.7, 0.1), glassMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(5, 2.7, 0.1), glassMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(5, 2.7, 0.1), glassMaterial)
    ];

    glassPanels[0].position.set(-2.5, 1.5, -3.95);
    glassPanels[1].position.set(-2.5, 4.5, -3.95);
    glassPanels[2].position.set(-2.5, 7.5, -3.95);

    glassPanels.forEach(panel => {
        panel.castShadow = false;
        panel.receiveShadow = true;
        building.add(panel);
    });

    // Add building to scene
    scene.add(building);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0f0f0,
        roughness: 0.9
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper (subtle)
    const gridHelper = new THREE.GridHelper(20, 20, 0xcc9461, 0xe0e0e0);
    gridHelper.position.y = -0.4;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Mouse controls
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });

    // Touch controls
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    });

    canvas.addEventListener('touchmove', (event) => {
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;

        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.01;

        touchStartX = touchX;
        touchStartY = touchY;
    });

    // Animation loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Smooth rotation based on mouse/touch
        building.rotation.y += (targetRotationY - building.rotation.y) * 0.05;
        building.rotation.x += (targetRotationX - building.rotation.x) * 0.05;

        // Auto-rotate slowly
        building.rotation.y += 0.002;

        // Gentle floating animation
        building.position.y = Math.sin(time * 0.5) * 0.1;

        // Clamp rotation X
        building.rotation.x = Math.max(-0.3, Math.min(0.3, building.rotation.x));

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    function onWindowResize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', onWindowResize);

    // Initial resize
    onWindowResize();
});

import * as THREE from 'three'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import blobVertexShader from './shaders/blob/vertex.glsl'
import blobFragmentShader from './shaders/blob/fragment.glsl'
import * as dat from 'lil-gui'



const gui = new dat.GUI()
let musicOn = false

/**
 * Loaders
 */

let sceneReady = false
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Base
 */
// Debug
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x111111)


/**
 * Objects
 */
debugObject.lowColor = "#8f007c"
debugObject.highColor = "#ff7300"

const uniforms = {
    u_time : {type: 'f', value: 0.0},
    u_frequency : {type: 'f', value: 0.0},
    u_lowColor : {type: 'v3', value: new THREE.Color(debugObject.lowColor)},
    u_highColor : {type: 'v3', value: new THREE.Color(debugObject.highColor)}
}

const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: blobVertexShader,
    fragmentShader: blobFragmentShader,
    wireframe: false
})

gui.addColor(debugObject,"lowColor").name("First color").onChange(()=>{
    mat.uniforms.u_lowColor.value.set(debugObject.lowColor)
})

gui.addColor(debugObject,"highColor").name("Second color").onChange(()=>{
    mat.uniforms.u_highColor.value.set(debugObject.highColor)
})

gui.add(mat, "wireframe").name("Wireframe")


//SPhere
//DodecahedronGeometry
//IcosahedronGeometry
//OctahedronGeometry
//TorusGeometry
//TetrahedronGeometry

const geo = new THREE.SphereGeometry(5,512,512);
let mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);
console.log(geo.parameters.detail)


/**
 * Lights
 */


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    bloomComposer.setSize(sizes.width, sizes.height)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

const params = {
    red: 1.0,
    green: 0.0,
    blue: 0.0,
    treshold: 0.5,
    strength: 0.5,
    radius: 0.8,
    sound: 0.2,
    chosenGeometry: 'IcosahedronGeometry'
}

camera.position.set(0, -2, 10)
camera.lookAt(0,0,0)
scene.add(camera)

function showSackbar() {
    snackbar.className = "show";
    setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 4800);
  }


function closeSnackbar(){
    snackbar.className = snackbar.className.replace("show", "");
}

const listener = new THREE.AudioListener();
camera.add(listener);

let sound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load('audio/Aaron Smith - Dancin (KRONO Remix).mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
});

gui.add(params, 'sound').min(0.0).max(1.0).step(0.01).onChange(() => {
    sound.setVolume(params.sound)
})

let fileInput = document.querySelector( '#file' );
fileInput.addEventListener( 'change', function( event ) {

	const reader = new FileReader();
	reader.addEventListener( 'load', function ( event ) {

		const buffer = event.target.result;

		const context = THREE.AudioContext.getContext();
		context.decodeAudioData( buffer, function ( audioBuffer ) {

            sound.stop()
            musicOn = false
            playBtn.style.filter = 'grayscale(100%)'
            playBtn.classList.remove('active')
            snackbar.innerHTML = '✔️ Music loaded !'
            showSackbar()

			sound = new THREE.Audio( listener );
            sound.setBuffer(audioBuffer)
            sound.setLoop(true)
            sound.setVolume(params.sound)
            analyser = new THREE.AudioAnalyser(sound, 256)

		} );

	} );

	const file = event.target.files[0];
	reader.readAsArrayBuffer( file );
} );

let analyser = new THREE.AudioAnalyser(sound, 256);

let fileInp = document.querySelector( '#file' );
let fileName = document.querySelector( '#fileName' );
fileInp.addEventListener( 'change', function( event ) {
    if(fileInp.files[0].name.length > 13){
        fileName.innerHTML = fileInp.files[0].name.substring(0, 13) + '...' + fileInp.files[0].name.substring(fileInp.files[0].name.length - 6, fileInp.files[0].name.length)
    }
    else{
        fileName.innerHTML = fileInp.files[0].name
    }
}
);

const playBtn = document.querySelector('.botón')
const snackbar = document.getElementById("snackbar");

playBtn.addEventListener('click', onPlayClick)

function onPlayClick(){
    if(musicOn === false)
    {
        sound.play()
        musicOn = true
        playBtn.children[0].innerHTML = 'Pause'
        return
    }
    else 
    {
        sound.pause()
        musicOn = false
        playBtn.children[0].innerHTML = 'Play'
        return
    }
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.outputColorSpace = THREE.SRGBColorSpace

const renderScene = new RenderPass(scene, camera)
const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height))
bloomPass.threshold = params.treshold
bloomPass.strength = params.strength
bloomPass.radius = params.radius

const bloomComposer = new EffectComposer(renderer)
bloomComposer.addPass(renderScene)
bloomComposer.addPass(bloomPass)

const outputPass = new OutputPass()
bloomComposer.addPass(outputPass)


const bloomFolder = gui.addFolder('Bloom')

bloomFolder.add(bloomPass, 'enabled').name('Bloom')

bloomFolder.add(params, 'treshold').min(0.0).max(1.0).step(0.01).onChange(() => {
    bloomPass.threshold = params.treshold
}
)
bloomFolder.add(params, 'strength').min(0.0).max(1.0).step(0.01).onChange(() => {
    bloomPass.strength = params.strength
}
)
bloomFolder.add(params, 'radius').min(0.0).max(1.0).step(0.01).onChange(() => {
    bloomPass.radius = params.radius
}
)




/**
 * Animate
 */

let mouseX = 0
let mouseY = 0

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

document.addEventListener('mousemove', (event) => {
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = (event.clientY - windowHalfY) / 100;

})


document.addEventListener('click', (event) => {
    console.log(event.cl)
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(mesh);
    if (intersects.length > 0) {
        if(musicOn === false)
        {
            sound.play()
            musicOn = true
            playBtn.children[0].innerHTML = 'Pause'
            return
        }
        else 
        {
            sound.pause()
            musicOn = false
            playBtn.children[0].innerHTML = 'Play'
            return
        }
    }
})

const clock = new THREE.Clock()
const tick = () =>
{
    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (- mouseY - camera.position.y) * .05;
    camera.lookAt(scene.position);

    const elapsedTime = clock.getElapsedTime()
    uniforms.u_time.value = elapsedTime;
    

    // Render
    uniforms.u_frequency.value = analyser.getAverageFrequency();
    bloomComposer.render()


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

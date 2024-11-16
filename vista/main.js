const videoElement = document.getElementById('webcam')
const statusElement = document.getElementById('status')
const resultElement = document.getElementById('result')
let model, webcam, maxPredictions
let lastSentIndex = -1 // Variable para almacenar el último índice enviado

// Función para iniciar la cámara y cargar el modelo
async function init() {
    try {
        // Solicitar acceso a la cámara
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
        })
        videoElement.srcObject = stream
        statusElement.textContent = 'Estado: Cámara detectada y funcionando'

        // Cargar el modelo de Teachable Machine
        const modelURL = 'model/model.json'
        const metadataURL = 'model/metadata.json'
        model = await tmImage.load(modelURL, metadataURL)
        maxPredictions = model.getTotalClasses()

        // Iniciar detección de objetos
        detect()
    } catch (error) {
        statusElement.textContent =
            'Error: No se pudo acceder a la cámara o cargar el modelo'
        console.error('Error:', error)
    }
}

// Función para detectar el objeto
async function detect() {
    const flip = true
    webcam = new tmImage.Webcam(640, 480, flip) // Configurar la webcam para Teachable Machine
    await webcam.setup()
    await webcam.play()
    statusElement.textContent = 'Estado: Detectando objetos'
    window.requestAnimationFrame(loop)
}

// Loop para predecir en cada frame
async function loop() {
    webcam.update()
    await predict()
    window.requestAnimationFrame(loop)
}

// Función para predecir el objeto
async function predict() {
    const predictions = await model.predict(webcam.canvas)
    let detectedObject = 'No detectado'

    // Mostrar el resultado de la predicción con mayor probabilidad
    predictions.forEach(async (prediction, i) => {
        if (prediction.probability > 0.9) {
            detectedObject = prediction.className

            if (i !== lastSentIndex) {
                await fetch(`http://localhost:3000/${i + 1}`)
                console.log('Enviado a arduino:', i + 1)
                lastSentIndex = i // Actualizar el último índice enviado
            }
        }
    })

    resultElement.textContent = `Resultado: ${detectedObject}`
}

// Iniciar el reconocimiento de objetos
init()

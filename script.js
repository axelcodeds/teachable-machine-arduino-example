const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const express = require('express')
const cors = require('cors')

// Set up the serial port connection
const port = new SerialPort({
    path: 'COM4',
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
})

// Use the Readline parser
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

parser.on('data', (data) => {
    const text = data.toString()

    console.log('Recibido de arduino', text)
})

port.on('open', () => {
    console.log('Conexión establecida con arduino')
})

const app = express()
const portNumber = 3000

app.use(cors())

app.get('/:mode', (req, res) => {
    const mode = req.params.mode
    port.write(mode)
    res.json({ message: 'Enviado a arduino: ' + mode })
})

app.listen(portNumber, () => {
    console.log(`Servidor escuchando en http://localhost:${portNumber}`)
})

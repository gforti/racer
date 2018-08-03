
const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

const sensor = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled


const http = require('http').createServer(app);
const url = require('url');
const fileSystem = require('fs');
const ip = require('ip')
const host_ip = ip.address()
const io = require('socket.io')(http) //require socket.io module and pass the http object (server)


function app (request, response) {

    var pathName = url.parse(request.url).pathname;
    var fileName = pathName.substr(1); /* lets remove the "/" from the name */
    
    if (!fileName.length) fileName = 'index.html'
    if (fileName === 'c') fileName = 'canvas.html'

    /* lets try to read the html page found */
    fileSystem.readFile(fileName , callback);

    function callback(err, data) {
        if (err) {
            console.error(err);
            /* Send the HTTP header
             * HTTP Status: 400 : NOT FOUND
             * Content Type: text/html
             */
            response.writeHead(400, {'Content-Type': 'text/html'});
            response.write('<!DOCTYPE html><html><body><div>Page Not Found</div></body></html>');
        } else {
            /* Send the HTTP header
             * HTTP Status: 200 : OK
             * Content Type: text/html
             */
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(data.toString());
        }

        /* the response is complete */
        response.end();
    }


}


http.listen(3005);

// Console will print the message
console.log(`Server running at http://${host_ip}:3005/index.html`);


let start = Date.now()
let isTilting = false
io.sockets.on('connection', function (socket) {// WebSocket Connection
  let tiltvalue = 0; //static variable for current status
  sensor.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    tiltvalue = value;
     //send button status to client
    start = Date.now()
  });  
});

setInterval(checkTilt, 100)

checkTilt() {
    if ( isTilting && Date.now() - start > 2000 ) {
        socket.emit('tiltStop');
        isTilting = false
    } else if(!isTilting && Date.now() - start < 2000) {
        socket.emit('tilt');
        isTilting = true
    }
}


function unexportOnClose() { //function to run when exiting program 
  sensor.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
};

process.on('SIGINT', unexportOnClose); //function to run when user closes using ctrl+c
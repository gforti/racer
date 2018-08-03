/*
 * Senors this code works
 * Tilt, PIR(Motion)
 */

var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

var sensor = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled

sensor.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
  if (err) { //if an error
    console.error('There was an error', err); //output error message to console
  return;
  }
  console.log(value)
  
});

function unexportOnClose() { //function to run when exiting program 
  sensor.unexport(); // Unexport Button GPIO to free resources
};

process.on('SIGINT', unexportOnClose); //function to run when user closes using ctrl+c
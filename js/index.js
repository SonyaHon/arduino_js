const {Arduino, Commands} = require('./arduino');
const arduino = new Arduino('/dev/cu.usbmodem1421', 'uno', {
  D9: Commands.OUTPUT,
  A0: Commands.INPUT
});

arduino.on('connected', () => {
  arduino.DigitalWrite('D9', Commands.FALSE);
});
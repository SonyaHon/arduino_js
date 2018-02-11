const serialport = require('serialport');
const Commands = require('./commands');
const EventsEmitter = require('events');


const CONF_UNO = {
  digital: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  analog: [14, 15, 16, 17, 18, 19],
  pwm: [3, 5, 6, 9, 10, 11]
};




class Arduino extends EventsEmitter {

  /*
   *  Init and connect with arduino.
   *  @param {string} - port with arduino
   *  @param {string} - type of arduino ('uno', 'nano')
   *  @param {object} - optional - (default - all output) pins, servos, etc. (need docs)
   */
  constructor(port, arduino_type, config) {
    super();
    this.serial = new serialport(port, {
      baudRate: 19200
    });
    this.conected = false;
    this.messageStack = [];
    this.message = [];
    switch (arduino_type) {
      default:
        this.model = CONF_UNO;
    }
    this.serial.on('data', (data) => {
      if (!this.conected) {
        if (data[data.length - 1] !== Commands.MSG_END) {
          this.message = this.message.concat(...data);
        }
        else {
          this.message = this.message.concat(...data);
          if (this.message[1] === Commands.MODEL_UNO || this.message === Commands.MODEL_NANO) {
            this.serial.write(Buffer.from([Commands.TRUE]), 1);
            this.conected = true;
            let msg = [];
            Object.keys(config).forEach((key) => {
              msg.push(this.__PinNameToPinNum(key));
              msg.push(config[key]);
            });
            this.__SendMessage(msg);
            this.emit('conected');
          }
          this.message = [];
        }
      }
      else {
        if (data[data.length - 1] !== Commands.MSG_END) {
          this.message = this.message.concat(...data);
        }
        else {
          this.message = this.message.concat(...data);
          let current_msg = this.messageStack.shift();
          this.message.pop();
          if (this.message.length === 1) {
            current_msg.clb(this.message[0]);
          }
          else {
            current_msg.clb(Buffer.from(this.message).toString());
            this.emit('data-received', {pin: current_msg.pin, value: Buffer.from(this.message).toString()});
          }
          this.message = [];
        }
      }
    });
  }


  /*
   * Gets pin number from pin name
   * @param {string} - pin name
   */
  __PinNameToPinNum(name) {
    let pinNum;
    if (name[0] === 'D') {
      pinNum = parseInt(name.substr(1));
      if (this.model.digital.indexOf(pinNum) !== -1) {
        return pinNum;
      }
      else {
        console.log('There is no such pin:', `D${pinNum}`);
      }
    }
    else if (name[0] === 'A') {
      pinNum = parseInt(name.substr(1));
      pinNum += 14;
      if (this.model.analog.indexOf(pinNum) !== -1) {
        return pinNum;
      }
      else {
        console.log('There is no such pin:', `A${pinNum}`);
      }
    }
    console.log('Pins can start with "A" or "D" only.');
  }

  /*
   * Sends message to arduino (warps with needed stuff) etc.
   */
  __SendMessage(message) {
    let buff = [Commands.MSG_BEGIN];
    buff = buff.concat(message);
    buff.push(Commands.MSG_END);
    this.serial.write(Buffer.from([buff.length]), 1);
    this.serial.write(Buffer.from(buff), buff.length);
  }

  DigitalRead(pin, clb) {
    this.__SendMessage([0x00, this.__PinNameToPinNum(pin)]);
    this.messageStack.push({type: 'digital', pin, clb});
  }

  DigitalWrite(pin, value) {
    let val;
    if (value == true || value == 1 || value === Commands.TRUE) val = Commands.TRUE;
    else val = Commands.FALSE;
    this.__SendMessage([0x01, this.__PinNameToPinNum(pin), val]);
  }

  AnalogRead(pin, clb) {
    this.__SendMessage([0x02, this.__PinNameToPinNum(pin)]);
    this.messageStack.push({type: 'analog', pin, clb});
  }

  AnalogWrite(pin, value) {
    let pnum = this.__PinNameToPinNum(pin);
    if (this.model.pwm.indexOf(pnum) === -1) {
      throw new Error("This pin does`t support pwm");
    }
    else {
      let val = parseInt(value);
      if (val < 0) val = 0;
      if (val > 255) val = 255;
      this.__SendMessage([0x03, pnum, val]);
    }
  }


  AnalogReadSmooth(pin, count, interval, clb) {
    let it = 0;
    let summ = 0;
    let int = setInterval(() => {
      if (it === count) {
        clearInterval(int);
        clb( Math.floor(summ / count));
      }
      it += 1;
      this.AnalogRead(pin, (data) => {
        summ += parseInt(data);
      });
    }, interval);
  }
}

module.exports = {
  Arduino,
  Commands
};
# ARDUINO-JS
## This  is just a wiki for me for now.

`Arduino(port, arduino_type, config)`
  * `port` - com port with arduino
  * `arduino_type` - type of arduino ("uno", "nano")
  * `config` - config of ports on arduino eg.
  ```javascript
      
      {
        D0: Commands.INPUT,
        A0: Commands.OUTPUT
      }
      
  ```
  keys are ports (like named on arduino eg. D0), values are possible pins mode
  Commands.INPUT, Commands.OUTPUT, Commands.INPUT_PULLUP
  
  ### Events
  
  connected - node connected to arduino and ready to receive commands
  
  data-received - (pin, value) - some data has been read from port. pin - pin name
  eg. 'D0', value - value
  
  ### Methods
  `DigitalRead(pin, callback)` - reads signals from pin. (digital)
  * `pin` - pin name eg. 'D0'
  * `callback(data)` - when read receives Commands.HIGH or Commands.LOW to this callback
  
  `DigitalWrite(pin, value)` - writes HIGH or LOW to the pin
  * `pin` - pin name eg 'D0'
  * `value` - one of Commands.HIGH or Commands.LOW
  
  `AnalogRead(pin, callback)` - reads signal from pin (analog)
  * `pin` - pin name
  * `callback(data)` - when read receives value [0-1023]
  
  `AnalogReadSmooth(pin, count, interval, callback)` - reads smooth value from
  analog port
  * `pin` - pin name
  * `count` - number of readings
  * `interval` - time interval in ms between reads
  * `callback` - when read receives value  [0-1023]
  
  `AnalogWrite(pin, data)` - writes pmw data to port
  * `pin` - pin name
  * `data` - num value in [0-255]
   
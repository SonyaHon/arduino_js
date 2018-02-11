#include "Servo.h"
// SETTINGS
#define ARDUINO_MODEL "uno" // can be "uno" or "nano"

// END

bool CONNECTED;
bool isReading;

/*
 * 0x00 - digitalRead [0x00, pinNumber]
 * 0x01 - digitalWrite [0x01, pinNumber, value(TRUE/FALSE)] 
 * 0x02 - analogRead [0x02, pinNumber]
 * 0x03 - analogWrite [0x03, pinNumber, value(0-255)]
 * 
 */

void setup() {
  CONNECTED = false;
  digitalWrite(13, false);
  
  uint8_t model = 0x00;
  if(ARDUINO_MODEL == "uno") {
    model = 0x01;
  }
  else {
    model = 0x02;
  }

  Serial.begin(19200);
  uint8_t message[3] = {0x62, model, 0x65};
  Serial.write(message, 3);
  while(!Serial.available()) delay(100);
  model = Serial.read();
  CONNECTED = (model == 0x74);
  while(!Serial.available()) delay(100);
  model = Serial.read();
  if(model != 0x00) {
    uint8_t conf[model];
    while(Serial.available() < model) {delay(100);}
    size_t readed = Serial.readBytesUntil(0x65, conf, model);
    if(readed == model - 1){
     for(size_t i = 1; i < model - 1; i+=2) {
        pinMode(conf[i], conf[i+1] == 0 ? OUTPUT : (conf[i+1] == 1 ? INPUT : INPUT_PULLUP)); 
        
     }
    }
  }
  
}

void loop() {
  
  if(!CONNECTED) return;

  if(Serial.available()) {
    uint8_t msg_len = Serial.read(); 
    uint8_t msg[msg_len];
    size_t readed = Serial.readBytesUntil(0x65, msg, msg_len);
    if(readed == msg_len - 1) {  
      switch(msg[1]) {
        case 0x00:
            Serial.print(digitalRead(msg[2]));
            Serial.write(0x65);
          break;
        case 0x01:
            digitalWrite(msg[2], msg[3] == 0x74 ? HIGH : LOW);
          break;
        case 0x02:
          Serial.print(analogRead(msg[2]));
          Serial.write(0x65);
          break;
        case 0x03:
          analogWrite(msg[2], msg[3]);
          break;
      }
    }
    else {
      Serial.flush();
    }
  }
}

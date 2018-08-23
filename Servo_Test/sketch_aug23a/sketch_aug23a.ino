#include <Servo.h>

Servo testServo;

const int forward = 92;
const int stop = 90;
const int backward = 88;

int pos = 0;

void setup() {
  testServo.attach(2);
  Serial.begin(9600);
}

void loop() {
    delay(2000);
    pos = ((pos + 15) % 360);
    testServo.write(forward);
    while(testServo.read() != pos) {
      Serial.println(testServo.read());
      delay(10);
    }
    
    testServo.write(stop);
    delay(2000);
}

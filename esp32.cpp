#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <SimpleDHT.h>

#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

/* WiFi */
#define WIFI_SSID "Alumnos"
#define WIFI_PASSWORD "@@1umN05@@"

/* Firebase */
#define API_KEY "AIzaSyAykJz-Zk6QuYgZ7DwZO2wTpwubxl5WoNs"
#define DATABASE_URL "sensordht11-969aa-default-rtdb.firebaseio.com/"
#define USER_EMAIL "ecamacho19@alumnos.uaq.mx"
#define USER_PASSWORD "polloyon_25"

/* Firebase objects */
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

/* DHT11 */
int pinDHT11 = D2;
int LED = D4;
SimpleDHT11 dht11(pinDHT11);
unsigned long lastHistoryMillis = 0;
const unsigned long historyInterval = 120000;

/* Timer */
unsigned long sendDataPrevMillis = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED, OUTPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando a WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }

  Serial.println();
  Serial.println("WiFi conectado");
  Serial.println(WiFi.localIP());

  /* Firebase config */
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  config.token_status_callback = tokenStatusCallback;

  Firebase.reconnectNetwork(true);
  fbdo.setBSSLBufferSize(4096, 1024);

  Firebase.begin(&config, &auth);
  Firebase.setDoubleDigits(2);
}

void loop() {

  if (!Firebase.ready()) return;

  byte temperature = 0;
  byte humidity = 0;

  int err = dht11.read(&temperature, &humidity, NULL);
  if (err != SimpleDHTErrSuccess) {
    Serial.println("Error DHT11");
    return;
  }

  if (millis() - lastHistoryMillis >= historyInterval || lastHistoryMillis == 0) {
    lastHistoryMillis = millis();

    FirebaseJson historyJson;
    historyJson.set("temperature", temperature);
    historyJson.set("humidity", humidity);
    historyJson.set("timestamp/.sv", "timestamp");

    if (Firebase.pushJSON(fbdo, "/dht11", historyJson)) {
      Serial.println("Registro guardado (NUEVO)");
    } else {
      Serial.print("Error: ");
      Serial.println(fbdo.errorReason());
    }
  }
}
require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT;
const cors = require("cors");
const seconds = 1000;

///////////////////// Setup of ds18b20 sensors
const lightingControl = require("./src/control_modules/onOff_vivariumLighting");
const { toggleDayNight } = lightingControl();
const { basking, hide, cool, mister } = require("./src/heating_configuration");
let isSpooky = false;
// setInterval(updateHumidity, 5000);

// let humidity = "non init";

// const updateHumidity = () => {
//   humidity = readSensorData();
//   console.log("Humidity is ");
//   console.log(humidity);
// };

// CHANGE LOGIC TO REDUCE HEATING TO 25c AT NIGHT

app.get("/current", cors(), (_req, res) => {
  const currentReadings = {
    baskingCurrent: basking.objectValue.currentTemp,
    hideCurrent: hide.objectValue.currentTemp,
    coolCurrent: cool.objectValue.currentTemp,
    humidityCurrent: mister.objectValue.currentHumidity,
    isSpooky: isSpooky,
  };

  console.log("request made for current readings");
  console.log(currentReadings);
  res.json(currentReadings);
  // res.send(basking.currentTemp);
});

app.get("/targetconfig", cors(), (req, res) => {
  const targetConfig = {
    baskingCurrent: basking.targetTemp,
    hideCurrent: hide.targetTemp,
  };

  res.json(targetConfig);
});

app.put("/targetconfig", cors(), (req, res) => {
  console.log("Someone is trying to update the target config");
  console.log(req);
});

// // increase basking temps
// app.get("/baskingtargetup", cors(), (req, res) => {
//   res.status(200).send(basking.targetTemp);
// });

const unspookify = () => {
  mister.toggleHumidity();
  toggleDayNight();
  isSpooky = false;
};

app.get("/toggledaynight", cors(), (req, res) => {
  console.log("Toggle Day Night Ran command from server");
  res.status(200).send(toggleDayNight());
});
app.get("/spookymode", cors(), (req, res) => {
  console.log("spookymode Ran command from server");
  isSpooky = true;
  toggleDayNight();
  mister.toggleHumidity();
  setTimeout(unspookify, 120 * seconds);

  res.status(200).send();

  // app.put("/spookymode", cors(), (req, res) => {
  //   res.json({ spookyMode: true });
  // });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Sets lcd display to refresh once a minute and passes heating controller to lcd_display
//setInterval(lcd_display.displayTemperatures, 60 * seconds, basking, hide, cool);

// process.on("SIGINT" || "exit", function () {
//   console.log("Sunny house is gracefully shutting down");
//   console.log("This code from index.js");
//   process.exit();
// });

const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const app = express();
const fs = require("fs");
var processedVideos = 0;
var resultsActual;

app.set('trust proxy',true); 
app.use(cors());
// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/rawlogs", function(request, response) {
  response.sendFile(__dirname + "/output.txt");
});
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
const io = require("socket.io")(listener);


app.get("/convert", (req, res) => {
  var uIP = req.ip
  console.log(uIP)
  console.log("New Request Processed");
  var URL = req.query.URL;
  res.header("Content-Type", "video/mp4", "Content-Disposition", "inline;");
  ytdl(URL, {
    format: "mp4"
  }).pipe(res);
  processedVideos = processedVideos + 1;
  var now = new Date();
  fs.appendFile(
    "./output.txt",
    "\nNew Stream Request Processed at " + now + " from public IPV4 " + uIP,
    { flags: "a+" },
    err => {
      //In case of a error throw err.
      if (err) throw err;
    }
  );
  io.emit("newRender", {renderer: req.ip, time: now});
});

app.get("/download", (req, res) => {
  var uIP = req.ip
  console.log("New Stream Request Processed");
  var URL = req.query.URL;

  res.header("Content-Disposition", "attachment; filename=video.mp4");
  ytdl(URL, {
    format: "mp4"
  }).pipe(res);
  var now = new Date();
  var logSent = false;
  if (logSent == false) {
    fs.appendFile(
      "./output.txt",
      "\nNew Download Request Processed at " + now + " from public IPV4 " + uIP,
      { flags: "a+" },
      err => {
        //In case of a error throw err.
        if (err) throw err;
      }
    );
    logSent = true;
  }
  io.emit("newDownload", {renderer: req.ip, time: now});
});


$(document).ready(function() {

  $("#button").click(function(){
    currentCity = $("#city").val();
    getNewData();
  });

  var w = $(document).width()/2;
  if ($(document).width() > 600) {
    w = 300 + 32;
  }

  console.log(w);

  $("#arc-slider").roundSlider({
    sliderType: "min-range",
    circleShape: "custom-quarter",
    value: 50,
    startAngle: 45,
    editableTooltip: true,
    radius: w,
    width: 0,
    handleSize: "+30",
    showTooltip: false,
    tooltipFormat: function (args) {
        $("#info").html("<p>You're playing God now.</p>");
        updateBackground(args.value);
        sendToParticle(args.value);
    }
  });

  if ($('.arc-container').width()/4 > 260) $('.arc-container').height(260);
  else $('.arc-container').height($('.arc-container').width()/4);

  $("#city").val(currentCity);
  getNewData();

});

// Photon
var devID = "210024000447343233323032";
var functionName = "update";
var token = "6860de2b5bb56fbfdb15a89569125e0a4af72802";

// API
var apikey = "495c5493936c3ea2468546636c41610d";

// App
var currentCity = "Toronto";
var data;
var sunrise;
var sunset;
var p;

function getNewData() {

  console.log(currentCity);
  var url = "http://api.openweathermap.org/data/2.5/weather?q="+currentCity+"&APPID="+apikey;
  $.getJSON( url, function(jsonData) {
            data = jsonData;
            getSunriseTime();
            getSunsetTime();
            var s = calcTime(sunrise, sunset);
            sendToParticle (s);
          });
}

function getSunriseTime () {
  var unixTime = data.sys.sunrise;
  sunrise = new Date(unixTime*1000);
}

function getSunsetTime () {
  var unixTime = data.sys.sunset;
  sunset = new Date(unixTime*1000);
}

function updateHTML(p, ct, sr, tl) {

  if (p < 0 || p > 100) {

    console.log(sr-ct);
    var h = Math.floor((sr - ct)/60);
    var m = (sr-ct)-(60*h);

    $("#info").html("<p>" + h +" hours and " + m + " minutes for the next sunrise in <b>" + data.name 
 + "</b></p>");
  
  }

  else if (p > 0) {

    var h = Math.floor(tl/60);
    var m = tl-(60*h);

    $("#info").html("<p>" + h +" hours and " + m + " minutes for the sunset in <b>" + data.name + "</b></p>");
  
  }

}

function sendToParticle (d) {

  console.log(d);

  var requestURL = "https://api.spark.io/v1/devices/" +devID + "/" + functionName + "/";
  
  $.post( requestURL, { params: d, access_token: token })
    .done(function() {
      console.log("done");
  });

}

function calcTime (rise, set) {

  //sunrise time in minutes
  var sr = rise.getHours()*60 + rise.getMinutes();
  //sunset time in minutes
  var ss = set.getHours()*60 + set.getMinutes();
  // minutes of sun light for the day
  var m = ss - sr;
  if (sr > ss) m += (60*24); 

  //current time in minutes
  var ct = new Date();
  ct = ct.getHours()*60 + ct.getMinutes();

  // time past in minutes
  var tp = ct - sr;
  if (sr > ss && ct < sr) tp = (60*24) - sr + ct;

  // time left in minutes;
  var tl = m - tp;

  //sun light progress in %
  p = Math.round((tp*100)/m);
  $("#arc-slider").roundSlider("setValue", p);

  console.log(sr + " sunrise");
  console.log(ss + " sunset");
  console.log(ct + " now");
  console.log(m + " minutes of sun in total for today");
  console.log(tp + " minutes past since sunrise");
  console.log(tl + " minutes left");
  console.log(p+"% past");

  updateHTML(p, ct, sr, tl);

  return tl+","+p;
}

function updateBackground (n) {

  if (n > 50) {
    n = 100 - n;
  }
  var r = Math.round(n * 5.1);
  var g = Math.round(n * 2.04);
  var b = Math.round(255 - (n * 5.1));

  var newColor = "rgba("+r+","+g+","+b+",0.3)";
  console.log(newColor);

  $(".container").css("background-color", newColor);

}

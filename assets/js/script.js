
var historyList = document.querySelector("#search-history");
var searchHistory = [];
const API_KEY = "cb6420d0d0462b86d556422b020e86b4";
var tasks = {};
var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var loadTasks = function() {
    tasks = JSON.parse(localStorage.getItem("tasks"));
    
    if (!tasks) {
        tasks = {};
    }

    if(tasks) {
        $(".description").each(function( index ) {
            if(tasks[index]) {
                $( this ).text(tasks[index]);
            }
        });
    }
};

var saveHistory = function (userCity){
  if(searchHistory.includes(userCity)) {
    var ind = searchHistory.indexOf(userCity);
    searchHistory.splice(ind,1);
  }
  searchHistory.unshift(userCity);
  localStorage.setItem("cities", JSON.stringify(searchHistory));
};


var loadHistory = function () {
  
  var savedHistory = JSON.parse(localStorage.getItem("cities"));
  if(!savedHistory) {
    savedHistory=[];
  }
  else {
    printHistory(savedHistory);
  }

};

var printHistory = function(userHistory) {
  var history = userHistory;
  console.log(history);  
  // for(var i =0; i < history.length; i++) {
  //   $("#search-history").append("<div class='search-history-item border-bottom border-gray' data-city='"+ 
  //                                     history[i] +"'>"+ 
  //                                     history[i] + 
  //                                     "</div>");    
  // }
}
var getDate = function(userCityTime, offset) {
  var result;
  var utcMoment = moment.utc();
  result = utcMoment.add(userCityTime, "s").add(offset,"d").format("M/D/YYYY");
  return result;
};
//favorable, moderate, or severe
var displayUV = function (lat, lon) {
  var apiUrl = "http://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY;
  fetch(apiUrl)
    .then(function(response) {
      if (response.ok) {
        response.json().then(function(data) {
          $("#city-uv").text(data.value);
          var iUV = parseInt(data.value);
          $("#city-uv").css({ padding : "10px" });
          $("#city-uv").css('color','white');
          if (iUV <= 2) {
            $("#city-uv").css('background-color', 'green');            
          }
          else if (iUV <= 5) {
            $("#city-uv").css('background-color', 'yellow');
          }
          else {
            $("#city-uv").css('background-color', 'red');
          }
        });
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function(error) {
      alert("Unable to connect to openWeather");
    });
    
};

var displayIcon = function(iconID){
  var iconUrl = "http://openweathermap.org/img/w/" + iconID + ".png";
  $("#city-icon").attr("src", iconUrl);
};

var displayWeather = function(data) {
  var cityName = data.name;
  var cityTemp = data.main.temp + "℃";
  var cityHum = data.main.humidity;
  var cityWind = data.wind.speed;
  var cityDate = getDate(data.timezone,0);
  
  var str = "name: " + cityName + " temp: " + cityTemp + " hum: " + cityHum + " wind: " + cityWind;
  $("#city-temp").text(cityTemp);
  $("#city-hum").text(cityHum);
  $("#city-wind").text(cityWind);
  $("#city-date").text("("+cityDate+")");
  $("#city-name").text(cityName);
  displayIcon(data.weather[0].icon);
  displayUV(data.coord.lat,data.coord.lon);
};


var displayFuture = function (data) {
  $("#forecast").empty();
  for (var i = 7; i <= data.list.length; i+=8) {
    var j = i/7;
    var futureDate = getDate(data.city.timezone, j);
    var futureTemp = data.list[i].main.temp;
    var futureHum = data.list[i].main.humidity;
    var futureIcon = data.list[i].weather[0].icon;

    $("#forecast").append("<div class='col-md-2 forecast-5day'>" +
                              "<p class='future-p future-date'>" + futureDate + "</p>" +
                              "<img class='future-p' src='http://openweathermap.org/img/w/" + futureIcon + ".png'>" +
                              "<p class='future-p'>Temperature: " + futureTemp + "</p>" +
                              "<p class='future-p'>Humidity: " + futureHum + "</p>");
    
  }
};
var getUserCity = function(city) {
  // format the github api url
  var apiUrlPresent = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + API_KEY;
  var apiUrlFuture = "https://api.openweathermap.org/data/2.5/forecast?q="+city+"&units=metric&appid="+API_KEY;

  // make a get request to url
  fetch(apiUrlPresent)
    .then(function(response) {
      // request was successful
      if (response.ok) {
        response.json().then(function(data) {
          displayWeather(data);
        });
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function(error) {
      alert("Unable to connect to openWeather");
    });
// 0 8 16 24 32 39
    fetch(apiUrlFuture)
    .then(function(response) {
      // request was successful
      if (response.ok) {
        response.json().then(function(data) {
          displayFuture(data);
        });
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function(error) {
      alert("Unable to connect to openWeather");
    });
};

$("form").submit(function ( event ) {
  event.preventDefault();
  var userCity = $( "input" ).first().val();
  if (userCity) {
    searchHistory.push(userCity);
    saveHistory(userCity);
    loadHistory();
    getUserCity(userCity);

  } else {
    alert("Please enter a city");
  }  
});

$("#search-history").on("click", function(event){
  event.preventDefault();
  var userCity = event.target.getAttribute("data-city");

  searchHistory.push(userCity);
  getUserCity(userCity);
  saveHistory(userCity);
  loadHistory();
});

loadHistory();
$(document).ready(function() {
  // Monkeypatch String to have a capitalize method, capitalizes first letter. Source: http://stackoverflow.com/a/1026087/5602463
  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };
  
  // Twitch channels/users
  var channels = [
    "freecodecamp",
    "noobs2ninjas",
    "beohoff",
    "summit1g",
    "medrybw",
    "abc123_fake", // Returns 404 not found
    "brunofin", // Returns 422 accoutn closed
  ];
  
  /* Function that takes response data from Twitch api as a first parameter and builds the list of channels.  The second 
     parameter either adds the class of "online" or "offline" depending if they have an active stream. */
  function buildLi(data, status) {
    var name = data._links.channel.replace("https://api.twitch.tv/kraken/channels/", "").capitalize();
    var chan = "https://www.twitch.tv/" + name;
    
    $("#main-list").append("<li class='" + status + " text-left'><a target='_blank' href='" + chan + "'><span class='name-display'>" + name + "</span></a></li>");
    
    if(data.stream) {
      $("#main-list li:last-child a").append("<div class='status-icon text-right'><i class='fa fa-thumbs-up fa-lg'> Online</i></div><p>" + data.stream.channel.status + "</p>");
    } else {
      $("#main-list li:last-child a").append("<div class='status-icon text-right'><i class='fa fa-times-circle fa-lg'> Offline</i></div>");
    }
  }
  
  /* Function takes data with 404 error and builds <li> */
  function build404(data) {
    var name = data.message.replace("Channel '", "").replace("' does not exist", "").capitalize();
    var icon = "<div class='status-icon text-right'><i class='fa fa-times-circle fa-lg'> Error</i></div>";
    var message = "<p>" + data.message + "</p>";
    var mainLi = "<li class='error text-left offline'><span class='name-display'>" + name + "</span></a>" + icon + message + "</li>";
            
    $("#main-list").append(mainLi);
  }
  
  /* Function takes data with 422 error and builds <li> */
  function build422(data) {
    var name = data.message.replace("Channel '", "").replace("' is unavailable", "").capitalize();
    var icon = "<div class='status-icon text-right'><i class='fa fa-times-circle fa-lg'> Error</i></div>";
    var message = "<p>Account Closed</p>";
    var mainLi = "<li class='error text-left offline'><span class='name-display'>" + name + "</span></a>" + icon + message + "</li>";
            
    $("#main-list").append(mainLi);
  }
  
  /* Function takes an array of jQuery <li> objects and shows/hides each according to whether their text equals the 
     search params. */
  function searchList(searchArray, target) {
    for(var i = 0; i < searchArray.length; i++) {
      var current = $(searchArray[i]);
      var possible = current.text().substring(0, target.length).toLowerCase();
      
      if(target === '') { // Re-shows items if search input is cleared
        current.show();
      } else if(target === possible) {
        current.show();
      } else {
        current.hide();
      }
    }
  }
  
  // Iterates the channels array and calls
  for(var channel in channels) {    
    $.ajax({
      url: 'https://api.twitch.tv/kraken/streams/' + channels[channel],
      dataType: 'jsonp', // JSONP to prevent CORS errors
      success: function(data) {
        if(data.status === 404) {
          build404(data); // Create Channel with 404 error message
        } else if(data.status === 422) {
          build422(data); // Create Channel with 422 error message
        } else {
          data.stream ? buildLi(data, "online") : buildLi(data, "offline"); // Checks if channel is currently streaming
        }       
      },
      error: function(error) {
        console.log(error);
        alert("There was a problem processing the request");
      }
    });
  }

  // Handle tab clicks
  $("#all").on("click", function() {
    $(".offline").show();
    $(".online").show(); 
    $("#search").val('');
  })
  
  $("#online").on("click", function() {
    $(".offline").hide();
    $(".online").show();
    $("#search").val('');
  });
  
  $("#offline").on("click", function() {
    $(".online").hide();
    $(".offline").show();
    $("#search").val('');
  })
  
  // Searches on key up to make sure to include the last character entered in search
  $("#search").keyup(function() {
    var searchVal = $("#search").val().toLowerCase();
    
    if($("#all").hasClass("active")) {   
      var searchItems = $(".online, .offline");     
      searchList(searchItems, searchVal);
    }
    
    if($("#online").hasClass("active")) {
      var searchItems = $(".online");      
      searchList(searchItems, searchVal);
    }
    
    if($("#offline").hasClass("active")) {
      var searchItems = $(".offline");      
      searchList(searchItems, searchVal);
    }
  })
})
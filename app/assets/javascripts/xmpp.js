var BOSH_SERVICE = "/http-bind";
var connection = null;

function onAttach(status) {
  if (status == Strophe.Status.DISCONNECTED) {
    console.log('Disconnected.');
  }
  else if (status == Strophe.Status.ATTACHED) {
    console.log('Strophe is attached.');
  }
  connection.send($pres().tree());
  connection.addHandler(onMessage, null, 'message', null, null, null);
}

function onMessage(message) {
  var text = $(message).find('body').text();
  console.log("Vou append "+text);
  $('.chat-window').append("<p>"+text+"</p>");

  return true;
}
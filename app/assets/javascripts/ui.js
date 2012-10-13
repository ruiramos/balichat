var Ui = function() {}

Ui.appendMessage = function(from, text) {
  $('.chat-window').append("<p><span>&lt;"+from+"&gt;</span> "+text+"</p>")
}

$(document).ready(function () {
  $('.chat-input-field').keydown(function (e) {
    if (e.keyCode == 13) {
      var text = $(this).val();
      jabber.sendGroupMessage('amizade@conference.pylon.local', text);
      $(this).val("");

      return false;
    }
  });
});
var Ui = function() {}

Ui.appendMucMessage = function(from, text) {
  $('.chat-muc-messages').append("<p><span>&lt;"+from+"&gt;</span> "+text+"</p>")
  Ui.scrollBottom();
}

Ui.scrollBottom = function() {
  var scrollDiv = $('.scroll-pane');
  var api = scrollDiv.data('jsp');
  api.reinitialise();
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
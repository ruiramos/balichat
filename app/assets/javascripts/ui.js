var Ui = function() {
  var scrollDiv = $('.scroll-pane');
  this.api = scrollDiv.data('jsp');
}

Ui.fn = Ui.prototype;

Ui.fn.appendMucMessage = function(from, text) {
  var scrollBottom = true;

  if (this.api.getPercentScrolledY() != 1) {
    scrollBottom = false;
  }

  $('.chat-muc-messages').append("<p><span>&lt;"+from+"&gt;</span> "+text+"</p>")
  this.updateChatWindow();

  if (scrollBottom == true || from == Strophe.getBareJidFromJid(jabber.jid)) {
    this.scrollBottom();
  }
}

Ui.fn.updateChatWindow = function() {
  this.api.reinitialise();
}

Ui.fn.scrollBottom = function() {
  this.api.scrollToPercentY(100, false);
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
var Ui = function() {
  this.status = {
    online: "Available",
    away: "Away",
    xa: "Not available",
    dnd: "Busy",
    chat: "Free for a chat"
  }

  this.notifications = {
    join: 'join',
    part: 'part'
  }
}

Ui.fn = Ui.prototype;

Ui.fn.htmlescape = function(text) {
  return text.replace(/&/g,'&amp;').
              replace(/>/g,'&gt;').
              replace(/</g,'&lt;').
              replace(/"/g,'&quot;');
}

$(document).ready(function () {
  $('.chat-input-field').keydown(function (e) {
    if (e.keyCode == 13) {
      var text = $(this).val();
      window.muc.sendMessage(text);
      $(this).val("");

      return false;
    }
  });
});
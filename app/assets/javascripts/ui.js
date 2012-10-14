var Ui = function() {
  this.status = {
    online: "Available",
    away: "Away",
    xa: "Not available",
    dnd: "Busy",
    chat: "Free for chat"
  }

  this.notifications = {
    join: 'user-joins',
    leave: 'user-leaves',
    topic: 'topic'
  }
}

Ui.fn = Ui.prototype;

Ui.fn.insertBreaks = function(text) {
  return text.replace(/\n/, "<br>");
}

Ui.fn.htmlescape = function(text) {
  return text.replace(/&/g,'&amp;').
              replace(/>/g,'&gt;').
              replace(/</g,'&lt;').
              replace(/"/g,'&quot;');
}

Ui.fn.expandEmbeds = function() {

  if($('#expand-embeds').attr("checked")!="checked"){ 
    $('.embedded').hide();
    $('small.link-source').addClass('noEmbedds');

  } else {
    $('.embedded').show();
    $('small.link-source').removeClass('noEmbedds');
  }

window.muc.ui.api.reinitialise();
window.muc.ui.api.scrollToBottom();

}

$(document).ready(function () {
  $('.chat-input-field').keydown(function (e) {
    if (e.keyCode == 13 && event.shiftKey){
      return true;
    } else if (e.keyCode == 13) {
      var text = $(this).val();
      text = $.trim(text);
      if(text.length){
        window.muc.sendMessage(text);
      }
      
      $(this).val("");
      return false;
    }
  });

  $('#expand-embeds').change(function(){gui.expandEmbeds();});

});
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

Ui.fn.submitTopic = function(text) {
  window.muc.changeTopic(text);
  $('.topic.edit').hide();
  $('.topic.editable').show();
  $('.chat-input-field').focus();
}

Ui.fn.topicHandler = function() {
  var that = this;

  $('.topic.editable').click(function() {
    $(this).hide();
    $('.topic.edit').show();
    $('.topic.edit input').val($('.topic.editable').text());
    $('.topic.edit input').focus();
  });

  $('.topic.edit').keydown(function(e) {
    if (e.keyCode == 13) {
      var text = $(this).val();
      if (text.length) {
        that.submitTopic(text);
      }
    }
  });
}

$(document).ready(function () {
  $('.chat-input-field').keydown(function(e) {
    if (e.keyCode == 13 && event.shiftKey) {
      return true;
    } else if (e.keyCode == 13) {
      var text = $(this).val();
      text = $.trim(text);
      if (text.length) {
        window.muc.sendMessage(text);
      }
      
      $(this).val("");
      return false;
    }
  });

  $('#expand-embeds').change(function(){ gui.expandEmbeds(); });

  // Focus on input field
  $('.chat-input-field').focus();

  // Add topic interactions
  Ui.fn.topicHandler();
});
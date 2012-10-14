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

  this.window_focus = true;
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
  if ($('#expand-embeds').attr("checked")!="checked") { 
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
  if (text == "_button") {
    text = $('input#topic').val();
  }

  if (text.length > 0) {
    connection.muc.setTopic(window.muc.jid, text);
    $('.topic.editable').text(text);
  }

  $('.topic.editable').show()
  $('.topic.edit').hide();
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

  $('input#topic').keydown(function(e) {
    if (e.keyCode == 13) {
      var text = $(this).val();
      if (text.length) {
        that.submitTopic(text);
      }
    }
  });
}

Ui.fn.focusHanler = function() {
  $(window).focus(function() {
    this.window_focus = true;
  }).blur(function() {
    this.window_focus = false;
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

  // Add window focus handler
  Ui.fn.focusHanler();
});
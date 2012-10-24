var BaliUi = function() {
  // Timeformat used for messages
  this.timeFormat = 'HH\\hmm';

  this.defaultTitle = 'Balichat';

  this.status = {
    online: 'Available',
    away: 'Away',
    xa: 'Not available',
    dnd: 'Busy',
    chat: 'Free for chat',
    unavailable: 'Offline'
  }

  // Controlls if the balichat window is focused or not.
  this.windowFocus = true;
}

BaliUi.fn = BaliUi.prototype;

BaliUi.fn.expandEmbeds = function() {
  if ($('#expand-embeds').attr("checked")!="checked") {
    $('.embedded').hide();
    $('small.link-source').addClass('noEmbedds');
  } else {
    $('.embedded').show();
    $('small.link-source').removeClass('noEmbedds');
  }

  this.getActiveMuc().ui.scroll.reinitialise();
  this.getActiveMuc().ui.scroll.scrollToBottom();
}

BaliUi.fn.submitTopic = function() {
  var text = $('input#topic').val();

  if (text.length > 0) {
    this.getActiveMuc().setTopic(text);
    $('.topic.editable').text(text);
  }

  $('.topic.editable').show()
  $('.topic.edit').hide();
  $('.chat-input-field').focus();
}

BaliUi.fn.topicHandler = function() {
  var thisUi = this;

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
        thisUi.submitTopic();
      }
    }
  });
}

BaliUi.fn.focusHandler = function() {
  var thisUi = this;
  $(window).focus(function() {
    console.log("FOCUS");
    thisUi.windowFocus = true;
    thisUi.clearTitleBar();
  }).blur(function() {
    console.log("NO FOCUS");
    thisUi.windowFocus = false;
  });
}

BaliUi.fn.getActiveMuc = function() {
  return bali.getActiveMuc();
}

BaliUi.fn.updateTitleBar = function() {
  //console.log("UPDATE TITLEBAR! "+this.windowFocus);
  if (!this.windowFocus) {
    var activeMuc = this.getActiveMuc();
    var unread = activeMuc.unreadMessages++;
    var room = activeMuc.roomName;
    console.log("Nao ta focus, recebi msg! "+activeMuc.unreadMessages);
    document.title = "("+unread+") "+room;
  }
}

BaliUi.fn.clearTitleBar = function() {
  document.title = this.defaultTitle;
  var activeMuc = this.getActiveMuc();
  activeMuc.unreadMessages = 0;
}

BaliUi.fn.sendChatMessage = function() {
  var text = $('.chat-input-field').val();
  text = $.trim(text);

  if (text.length) {
    this.getActiveMuc().sendMessage(text);
  }

  $('.chat-input-field').val('');
}

$(document).ready(function () {
  $('.chat-input-field').keydown(function(e) {
    if (e.keyCode == 13 && event.shiftKey) {
      return true;
    } else if (e.keyCode == 13) {
      bali.ui.sendChatMessage();
      return false;
    }
  });

  $('#files-info-tooltip').tooltip();
  $('#mentions-tooltip').tooltip();
  $('#alerts-tooltip').tooltip();

  // Handles file-info popup
  $('.file-info').mouseover(function(){$('#file-info-tooltip').tooltip();})

  $('#expand-embeds').change(function(){ bali.ui.expandEmbeds() });

  // Focus on input field
  $('.chat-input-field').focus();

  // Add topic interactions
  BaliUi.fn.topicHandler();

  // Add window focus handler
  BaliUi.fn.focusHandler();
});
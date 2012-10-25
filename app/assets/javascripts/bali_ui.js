/* Copyright (c) 2012 Twintend (http://twintend.com)
 *
 * The gui of the application. Here we have all the methods that deal with
 * overall ui aspects like titlebar, chat input, etc.
 *
 */
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

  // Controls if the balichat window is focused or not.
  this.windowFocus = true;

  this.titleQueue = [this.defaultTitle];
  this.titleTimeout = null;
  this.currentTitle = 0;
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
  var oldTopic = $('.topic.editable').text();

  if (text.length > 0 && text != oldTopic) {
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
    } else if(e.keyCode == 27) {  // esc, dismiss
      $('.topic.edit').hide();
      $(this).val($('.topic.editable').text());
      $('.topic.editable').show();
      $('.chat-input-field').focus();
    }  
  });
}

BaliUi.fn.focusHandler = function() {
  $(window).focus(function() {
    bali.ui.windowFocus = true;
    bali.ui.clearTitleBar();
  }).blur(function() {
    bali.ui.windowFocus = false;
  });
}

BaliUi.fn.getActiveMuc = function() {
  return bali.getActiveMuc();
}

BaliUi.fn.updateTitleBar = function() {
  nextTitleIndex = this.currentTitle % this.titleQueue.length;
  if(typeof(this.titleQueue[nextTitleIndex]) === "string"){
    newTopic = this.titleQueue[nextTitleIndex];}
  else {
    newTopic = "("+this.titleQueue[nextTitleIndex].unread+") "+this.titleQueue[nextTitleIndex].room;
  }
  document.title = newTopic;
  this.currentTitle++;
}

BaliUi.fn.pushTitleBarMessage = function() {
  if (!this.windowFocus) {
    var activeMuc = this.getActiveMuc();
    var unread = ++activeMuc.unreadMessages;
    var room = activeMuc.roomName;
    var found = false;

    $(this.titleQueue).each(function(i, el) {
      if(room == el.room){
        el.unread = unread;
        found = true;
        return;
    }});

    if (!found) { 
      this.titleQueue.push({'room': room, 'unread':unread});
    }

    if (!this.titleTimeout) {
      this.titleTimeout = setInterval(function(){bali.ui.updateTitleBar();}, 1500);
    }
  }
}

BaliUi.fn.clearTitleBar = function() {
  this.titleQueue = [this.defaultTitle];
  clearInterval(this.titleTimeout);
  this.titleTimeout = null;
  this.updateTitleBar();
  this.currentTitle = 0;

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
  $('.file-info').mouseover(function(){ $('#file-info-tooltip').tooltip() })

  $('#expand-embeds').change(function(){ bali.ui.expandEmbeds() });

  // Focus on input field
  $('.chat-input-field').focus();

  // Add topic interactions
  BaliUi.fn.topicHandler();

  // Add window focus handler
  BaliUi.fn.focusHandler();
});
/* Copyright (c) 2012 Twintend (http://twintend.com)
 *
 * The gui of the application. Here we have all the methods that deal with
 * overall ui aspects like titlebar, chat input, etc.
 *
 */
var BaliUi = (function() {
  var status = {
    online: 'Available',
    away: 'Away',
    xa: 'Not available',
    dnd: 'Busy',
    chat: 'Free for chat',
    unavailable: 'Offline'
  }

  // Controls if the balichat window is focused or not.
  var windowFocus = true;

  return {
    'timeFormat': 'HH\\hmm',

    isFocused: function() {
      return windowFocus;
    },

    expandEmbeds: function() {
      if ($('#expand-embeds').attr('checked') != 'checked') {
        $('.embedded').hide();
        $('small.link-source').addClass('noEmbedds');
      } else {
        $('.embedded').show();
        $('small.link-source').removeClass('noEmbedds');
      }
      Bali.getActiveMuc().ui.scrollBottom();
    },

    submitTopic: function() {
      var text = $('input#topic').val();
      var oldTopic = $('.topic.editable').text();

      if (text.length > 0 && text != oldTopic) {
        Bali.getActiveMuc().setTopic(text);
        $('.topic.editable').text(text);
      }

      $('.topic.editable').show()
      $('.topic.edit').hide();
      $('.chat-input-field').focus();
    },

    topicHandler: function() {
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
    },

    focusHandler: function() {
      $(window).focus(function() {
        windowFocus = true;
        BaliTitle.clear();
      }).blur(function() {
        windowFocus = false;
      });
    },

    sendChatMessage: function() {
      var text = $('.chat-input-field').val();
      text = $.trim(text);

      if (text.length) {
        Bali.getActiveMuc().sendMessage(text);
      }

      $('.chat-input-field').val('');
    },

    updateInputWithHistory: function(text) {
      $('.chat-input-field').val(text);
    }
  }
}());

$(document).ready(function () {
  // Key press handling on the input field
  $('.chat-input-field').keydown(function(e) {
    if (e.keyCode == 13 && event.shiftKey) {
      return true;
    } else if (e.keyCode == 13) {
      BaliUi.sendChatMessage();
      return false;
    } else if (e.keyCode == 38) {
      var message = Bali.getActiveMuc().inputHistory.getPrevious();
      BaliUi.updateInputWithHistory(message);
      return false;
    } else if (e.keyCode == 40) {
      var message = Bali.getActiveMuc().inputHistory.getNext();
      BaliUi.updateInputWithHistory(message);
      return false;
    }
  });

  $('#files-info-tooltip').tooltip();
  $('#mentions-tooltip').tooltip();
  $('#alerts-tooltip').tooltip();

  // Handles file-info popup
  $('.file-info').mouseover(function(){ $('#file-info-tooltip').tooltip() })

  $('#expand-embeds').change(function(){ BaliUi.expandEmbeds() });

  // Focus on input field
  $('.chat-input-field').focus();

  // Add topic interactions
  BaliUi.topicHandler();

  // Add window focus handler
  BaliUi.focusHandler();
});
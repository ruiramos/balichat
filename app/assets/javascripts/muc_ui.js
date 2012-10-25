/* Copyright (c) 2012 Twintend (http://twintend.com)
 *
 * This is the class that manages this gui for one muc.
 *
 */
var MucUi = function(muc) {
  this.muc = muc;

  this.participantList = $('#user-list-'+muc.roomName);
  this.topicDiv = $('#topic-'+muc.roomName);

  //var scrollDiv = $('#muc-'+muc.roomName);
  //this.scroll = scrollDiv.data('jsp');

  // The welcome message, used to append backlog before it.
  this.welcomeMessage = this.appendWelcome();

  // Last chatMessage object. Which represents the last chatgroup message sent.
  this.lastEntry = this.welcomeMessage;
}

MucUi.fn = MucUi.prototype;

MucUi.fn.scrollBottom = function(animate) {
  //this.scroll.scrollToPercentY(30, animate);
}

MucUi.fn.handleMessage = function(participant, message) {
  this.handleTimedMessage(participant, message, moment());
}

MucUi.fn.handleTimedMessage = function(participant, message, timestamp) {
  console.log(participant);
  console.log(message);
  console.log(timestamp);
  var chatMessage = new ChatMessage(this.muc, participant, message, timestamp);
  this.appendMessage(chatMessage);
}

MucUi.fn.handleLeave = function(participant) {
  var message = '<strong>'+participant.nick+'</strong> left the room.';
  var type = ChatNotification.types.leave;
  this.appendNotification(type, message)
  this.removeParticipant(participant);
}

MucUi.fn.handleJoin = function(participant) {
  var message = '<strong>'+participant.nick+'</strong> joined the room.';
  var type = ChatNotification.types.join;
  this.appendNotification(type, message);
  this.handleStartParticipant(participant);
}

MucUi.fn.handleTopicChange = function(participant, topic) {
  var topic = Bali.escapeHtml(topic);
  var message = '<strong>'+participant.nick+'</strong> changed topic to: '+topic;
  var type = ChatNotification.types.topic;
  this.appendNotification(type, message);
}

// TODO: each muc should have 1 topic!!!!!!
MucUi.fn.handleTopicBacklog = function(participant, topic) {
  var topic = Bali.escapeHtml(topic);
  $('.topic.editable').text(topic);
}

MucUi.fn.appendWelcome = function() {
  var message = 'Welcome to '+this.muc.roomName;
  var type = ChatNotification.types.normal;
  return this.appendNotification(type, message);
}

MucUi.fn.handlePresence = function(participant) {
}

MucUi.fn.removeParticipant = function(participant) {
  var user = $('ul.users').find('li[title="'+participant.nick+'"]');
  user.animate({height: 'toggle', opacity: 'toggle'}, 'slow', function() {
    user.remove();
  });
}

MucUi.fn.handleStartParticipant = function(participant) {
  var list = this.participantList.find('ul.users');
  var user = participant.dom;
  user.hide();
  list.append(user);
  user.fadeIn('slow');
}

MucUi.fn.appendNotification = function(type, message) {
  var not = new ChatNotification(this.muc, type, message, moment());
  this.appendToMuc(not);

  return not;
}

/**
 * Updates the muc message area with a new message.
 */
MucUi.fn.appendMessage = function(message) {
  message.text = this.doReplacements(message.text);

  if (this.includeAsParagraph(message)) {
    message.buildAsParagraph();
  }

  // TODO: this should be per muc (for unread on tabs also)
  bali.ui.pushTitleBarMessage();
  this.appendToMuc(message);
}

/**
 * Updates the muc message area with a new entry. This entry can be one of two
 * different classes: ChatMessage and ChatNotification.
 */
MucUi.fn.appendToMuc = function(entry) {
  var scrollBottom = true;
  var animate = true;

  //if (this.scroll.getPercentScrolledY() != 1) {
  //  scrollBottom = false;
 // }

  // Scroll fast (don't animate) if the scroll is not 100% and is own message
  //if (entry.isOwnMessage() && this.scroll.getPercentScrolledY() != 1) {
  //  animate = false;
 // }

  if (entry.isParagraph && this.lastEntry.isParagraph) {
    this.lastEntry.dom.after(entry.dom);
  } else if (entry.isParagraph && !this.lastEntry.isParagraph) {
    this.lastEntry.dom.find('.text').last().after(entry.dom);
  } else {
    if (entry.isBacklog()) {
      this.welcomeMessage.dom.before(entry.dom);
    } else {
      $('.chat-muc-messages').append(entry.dom);
    }
  }

  //this.updateChatWindow();

  if (scrollBottom == true || entry.isOwnMessage()) {
    this.scrollBottom(animate);
  }

  this.lastEntry = entry;
}

/*
 * Check if the message is to be appended as new div or only paragraph of an old
 * div.
 */
MucUi.fn.includeAsParagraph = function(message) {
  var isParagraph = false;

  if (this.lastEntry.participant) {
    if (message.participant.nick == this.lastEntry.participant.nick) {
      if (message.isBacklog() == this.lastEntry.isBacklog()) {
        isParagraph = true;
      }
    }
  }

  return isParagraph;
}

MucUi.fn.doReplacements = function(text) {
  var $container = $('<div/>');
  var thisMucUi = this;
  var source = text;
  var hiddenClass = '';
  if ($('#expand-embeds').attr("checked") != "checked") hiddenClass = 'noEmbedds';

  if (text.match(/(?:^|\s)https?:\/\/(?:www.)?(?:vimeo.com)\//)) { // vimeo video embedd
    $container.append(text.replace(/(?:^|\s)https?:\/\/(?:www.)?vimeo.com\/(\d*)(?:$|\s)/,'<iframe src="http://player.vimeo.com/video/$1?title=1&amp;byline=1&amp;portrait=1" class="embedded '+hiddenClass+'" width="500" height="377" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'));  
    $container.append("<small class='link-source "+hiddenClass+"'>"+linkify(source)+"</small>");


  } else if (text.match(/(?:^|\s)https?:\/\/(?:www.)?(?:youtube.com)\//)) { // youtube video embedd
    $container.append(text.replace(/(?:^|\s)https?:\/\/(?:www.)?youtube.com\/watch\?v=(.*)(?:$|\s)/,'<iframe width="480" height="360" src="http://www.youtube.com/embed/$1" class="embedded '+hiddenClass+'" frameborder="0" allowfullscreen></iframe>'));
    $container.append("<small class='link-source "+hiddenClass+"'>"+linkify(source)+"</small>");


  } else if (text.match(/(?:^|\s)https?:\/\/(?:www.)?(.*)(\.jpg|\.png|\.gif|\.bmp)/i)) { //image embedd
    var img = $("<img class='embedded "+hiddenClass+"' src='"+text+"'>");
    $(img).load(function() {
      thisMucUi.scroll.reinitialise();
      thisMucUi.scroll.scrollToBottom();
    });

    $container.append(img);
    $container.append('<small class="link-source '+hiddenClass+'">'+linkify(source)+'</small>');
  
  } else {
    $container.append(linkify(text));
  }

  return $container;
}

MucUi.fn.joinHandler = function(stanza, muc, nick, text) {
  this.appendNotification("<strong>"+ nick + "</strong> joined the room.", gui.notifications.join);
}

MucUi.fn.sendTopicNotification = function(nick, topic, printNotification) {
  var newStr = "<strong>"+nick+"</strong> changed room topic to: "+topic;

  if (printNotification) {
    this.appendNotification(newStr, gui.notifications.topic);
  }

  this.topicDiv.text(topic);
}
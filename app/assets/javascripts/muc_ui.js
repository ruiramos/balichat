/* Copyright (c) 2012 Twintend (http://twintend.com)
 *
 * This is the class that manages this gui for one muc.
 *
 */
var MucUi = function(muc) {
  this.muc = muc;

  this.participantList = $('#user-list-'+muc.roomName);
  this.topicDiv = $('#topic-'+muc.roomName);
  this.scrollDiv = $('#muc-'+muc.roomName);

  // The welcome message, used to append backlog before it.
  this.welcomeMessage = this.appendWelcome();

  // Last chatMessage object. Which represents the last chatgroup message sent.
  this.lastEntry = this.welcomeMessage;
}

MucUi.fn = MucUi.prototype;

MucUi.fn.scrollBottom = function(animate, speed) {
  var thisMucUi = this;
  var scrollDown = $(thisMucUi.scrollDiv)[0].scrollHeight + 20;
  if (animate == true) {
    this.scrollDiv.animate({
      scrollTop: scrollDown
    }, speed);
  }
  else {
    this.scrollDiv.scrollTop(scrollDown);
  }
}

MucUi.fn.handleMessage = function(participant, message) {
  this.handleTimedMessage(participant, message, moment());
}

MucUi.fn.handleTimedMessage = function(participant, message, timestamp) {
  var chatMessage = new ChatMessage(this.muc, participant, message, timestamp);
  this.appendMessage(chatMessage);
}

MucUi.fn.handleLeave = function(participant) {
  var message = '<strong>'+participant.getNick()+'</strong> left the room.';
  var type = ChatNotification.types.leave;
  this.appendNotification(type, message)
  this.removeParticipant(participant);
}

MucUi.fn.handleJoin = function(participant) {
  var message = '<strong>'+participant.getNick()+'</strong> joined the room.';
  var type = ChatNotification.types.join;
  this.appendNotification(type, message);
  this.handleStartParticipant(participant);
}

MucUi.fn.handleTopicChange = function(participant, topic) {
  var topic = Bali.escapeHtml(topic);
  var message = '<strong>'+participant.getNick()+'</strong> changed topic to: '+topic;
  var type = ChatNotification.types.topic;
  this.appendNotification(type, message);
}

MucUi.fn.handleNotification = function(participant, subject, text) {
  var message = '<strong>'+participant.getNick()+'</strong> '+text;
  var type = ChatNotification.types.notification;
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
  var user = $('ul.users').find('li[title="'+participant.getNick()+'"]');
  user.animate({height: 'toggle', opacity: 'toggle'}, 'slow', function() {
    user.remove();
  });
}

MucUi.fn.handleStartParticipant = function(participant) {
  var list = this.participantList.find('ul.users');
  var user = participant.getDom();
  user.hide();
  list.append(user);
  user.fadeIn('slow');
}

MucUi.fn.appendNotification = function(type, message) {
  //message = this.doReplacements(message);
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
  } else {
    message.buildAsDiv();
  }

  // TODO: this should be per muc (for unread on tabs also)
  BaliTitle.pushMessage();
  this.appendToMuc(message);
}

MucUi.fn.getPercentScrolled = function() {
  var totalHeight = $(this.scrollDiv)[0].scrollHeight;
  var totalScroll = this.scrollDiv.scroll().scrollTop() + this.scrollDiv.height();
  var percent = (parseInt(totalScroll) * 100) / parseInt(totalHeight);

  return percent;
}

/**
 * Updates the muc message area with a new entry. This entry can be one of two
 * different classes: ChatMessage and ChatNotification.
 */
MucUi.fn.appendToMuc = function(entry) {
  var scrollBottom = true;
  var animate = true;

  if (this.getPercentScrolled() != 100) {
    scrollBottom = false;
  }

  // Scroll fast (don't animate) if the scroll is not 100% and is own message
  if (entry.isOwnMessage() && this.getPercentScrolled() != 100) {
    animate = false;
  }

  // Don't animate on backlog
  if (entry.isBacklog()) {
    animate = false;
  }

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

  if (scrollBottom == true || entry.isOwnMessage()) {
    this.scrollBottom(animate, 100);
  }

  this.lastEntry = entry;
}

/*
 * Check if the message is to be appended as new div or only paragraph of an old
 * div.
 */
MucUi.fn.includeAsParagraph = function(message) {
  var isParagraph = false;

  if (this.lastEntry && this.lastEntry.participant) {
    if (message.participant.getNick() == this.lastEntry.participant.getNick()) {
      if (message.isBacklog() == this.lastEntry.isBacklog()) {
        isParagraph = true;
      }
    }
  }

  return isParagraph;
}

// TODO: this should be extracted to a class! MALEMALEMAEL
MucUi.fn.doReplacements = function(text) {
  var $container = $('<div/>');
  var thisMucUi = this;
  var source = text;
  var hiddenClass = '';

  if ($('#expand-embeds').attr("checked") != "checked") hiddenClass = 'noEmbedds';

  if (text.match(/(?:^|\s)https?:\/\/(?:www.)?(?:vimeo.com)\//im)) { // vimeo video embedd
    $container.append(text.replace(/(?:^|\s)https?:\/\/(?:www.)?vimeo.com\/(\d*)(?:$|\s)/im,'<iframe src="http://player.vimeo.com/video/$1?title=1&amp;byline=1&amp;portrait=1" class="embedded '+hiddenClass+'" width="500" height="377" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'));  
    $container.append("<small class='link-source "+hiddenClass+"'>"+linkify(source)+"</small>");


  } else if (text.match(/(?:^|\s)https?:\/\/(?:www.)?(?:youtube.com)\//im)) { // youtube video embedd
    $container.append(text.replace(/(?:^|\s)https?:\/\/(?:www.)?youtube.com\/watch\?v=(.*)(?:$|\s)/im,'<iframe width="480" height="360" src="http://www.youtube.com/embed/$1" class="embedded '+hiddenClass+'" frameborder="0" allowfullscreen></iframe>'));
    $container.append("<small class='link-source "+hiddenClass+"'>"+linkify(source)+"</small>");


  } else if (text.match(/(?:^|\s)https?:\/\/(?:www.)?(.*)(\.jpg|\.png|\.gif|\.bmp)/im)) { //image embedd
    result = text.match(/(.*)(?:^|\s)(https?:\/\/(?:www.)?(?:.*)(?:\.jpg|\.png|\.gif|\.bmp))(.*)/im);

    var img = $("<img class='embedded "+hiddenClass+"' src='"+result[2]+"'>");
    $(img).load(function() {
      thisMucUi.scrollBottom();
    });


    $container.append(result[1]);
    $container.append(img);
    $container.append(result[3]);

    $container.append('<small class="link-source '+hiddenClass+'">'+linkify(result[2])+'</small>');
  
  } else if (text.match(/@(\w)/g)) {
    var match = text.match(/@(\w)/);
    $container.append(text.replace(/@(\w)/g, this.replaceMention(match[1])));
  } else {
    $container.append(linkify(text));
  }

  return $container;
}

MucUi.fn.replaceMention = function(mention) {
  var replaced = mention;
  
  $.each(this.muc.participants, function(i, participant) {
    if (participant.getNick() == mention) {
      replaced = '<span class="label label-info">'+participant.getNick()+'</span>'
    }
  });

  return replaced;
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
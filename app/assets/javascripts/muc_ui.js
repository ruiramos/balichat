var MucUi = function(connection, jid, nick) {
  var muc = {}; // make muc an object from the start. Needed by muc.window_focused focus tracking.
  var that = this;
  var handlers = {};

  this.timeFormat = "HH\\hmm";

  this.lastMessageFrom = "";
  this.lastMessageElement = "";

  this.roster = $('#user-list-'+Strophe.getNodeFromJid(jid));
  this.topicDiv = $('#topic-'+Strophe.getNodeFromJid(jid));

  var scrollDiv = $('#muc-'+Strophe.getNodeFromJid(jid));
  this.api = scrollDiv.data('jsp');

  muc = new Muc(this, jid, nick);
  muc.unread_messages = 0;
  muc.window_focused = true;
  muc.hide_slash_warning = false;

  window.muc = muc;
  return muc;
}

MucUi.fn = MucUi.prototype;

/**
 * Updates the muc message area with a new element. If called with no arguments
 * it will just do the scrolling stuff, because we are adding something that is not
 * a chat row. This happens when adding new paragraph on existing message.
 */
MucUi.fn.appendToMuc = function(element, isOwnMessage) {
  var scrollBottom = true;

  if (this.api.getPercentScrolledY() != 1) {
    scrollBottom = false;
  }

  if (element != null && $(element).find('.message').hasClass('old')) {
    $('#welcome-message').before(element);
  } else {
    $('.chat-muc-messages').append(element);
  }

  this.updateChatWindow();

  if (element != null || scrollBottom == true || isOwnMessage) {
    this.scrollBottom();
  }
}

MucUi.fn.includeAsParagraph = function(message) {
  var from = $(message).attr('from');
  var old = $(message).attr('old');
  var includeAsParagraph = true;
  var lastSystem = $(document).find('.message-container').last().attr('id') != null;

  if (from != this.lastMessageFrom) {
    includeAsParagraph = false;
  }

  if (lastSystem && old == null) {
    includeAsParagraph = false;
  }

  return includeAsParagraph;
}

/**
 * Updates the muc message area with a new message.
 */
MucUi.fn.appendMessage = function(nick, message, timestamp) {
  var from = $(message).attr('from');
  var text = $(message).find('body').text();

  // Replace newlines with <br>
  text = gui.insertBreaks(text);

  // Replace links, youtube clips, etc.
  text = this.doReplacements(text);

  if (this.includeAsParagraph(message) == false) {
    var $element = $('#empty-message').clone();
    $element.removeAttr('id');
    $element.find('.nick').text(nick);
    $element.find('.text').html(text);
    $element.find('.timestamp').text(moment(timestamp).format(this.timeFormat));
    $element.show();

    if (jabber.isOwnMessage(message)) {
      $element.find('.message').addClass('own');
    }
  }
  
  // Message from different jid of the last message
  if (this.includeAsParagraph(message) == false) {
    if ($(message).attr('old')) {
      $element.find('.message').addClass('old');
    }
    this.appendToMuc($element, jabber.isOwnMessage(message));
    this.lastMessageElement = $element;
  }
  // Message from the same user as the last one
  else {
    var $newParagraph = jQuery("<p></p>").html(text).addClass('text');
    this.lastMessageElement.find('.text').last().after($newParagraph);
    this.appendToMuc();
  }
}

MucUi.fn.doReplacements = function(text) {
  
  if($('#expand-embeds').attr("checked")!="checked"){  //we're not expanding embeds, linkify and get out of here!
    return linkify(text);
  }

  var source = text;
  
  if (text.match(/(?:^|\s)https?:\/\/(?:www.)?(?:vimeo.com|youtube.com)\//)) { //video embedd
    text = text.replace(/(?:^|\s)https?:\/\/(?:www.)?vimeo.com\/(\d*)(?:$|\s)/,'<iframe src="http://player.vimeo.com/video/$1?title=1&amp;byline=1&amp;portrait=1" width="500" height="377" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
    text = text.replace(/(?:^|\s)https?:\/\/(?:www.)?youtube.com\/watch\?v=(.*)(?:$|\s)/,'<iframe width="480" height="360" src="http://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>');
    text += "<small class='link-source'>"+linkify(source)+"</small>";
  
  } else if (text.match(/(?:^|\s)https?:\/\/(?:www.)?(.*)(\.jpg|\.png|\.gif|\.bmp)/)) { //image embedd
    text = "<img class='embedded' src='"+text+"'>";
    text += "<small class='link-source'>"+linkify(source)+"</small>";
  
  } else {
    text = linkify(text);
  }

  return text;
}

MucUi.fn.appendNotification = function(text, type) {
  var element = "<p class='notification'>"+text+"</p>";
  var $element = $('#empty-message').clone();
  this.appendToMuc(element, false);
}

MucUi.fn.updateChatWindow = function() {
  this.api.reinitialise();
}

MucUi.fn.scrollBottom = function() {
  this.api.scrollToPercentY(100, false);
}

MucUi.fn.joinHandler = function(stanza, muc, nick, text) {
  this.appendNotification(nick + " joined the room.", gui.notifications.join);
}

MucUi.fn.leaveHandler = function(stanza, muc, nick, text) {
  this.appendNotification(nick + " left the room.", gui.notifications.leave);
}

MucUi.fn.historyHandler = function(stanza, muc, nick, message) {
  var stamp = $(stanza).find('delay').attr('stamp');
  var $stanza = $(stanza);
  $stanza.attr('old', true);

  this.appendMessage(nick, $stanza, stamp);
  this.lastMessageFrom = $stanza.attr('from');
}

MucUi.fn.messageHandler = function(stanza, muc, nick, message) {
  this.appendMessage(nick, stanza, moment().format("YYYY-MM-DDTHH:mm:ss"));
  this.lastMessageFrom = $(stanza).attr('from');
}

MucUi.fn.mucRosterHandler = function(stanza, muc, nick, text) {
  var users = this.roster.find('ul.users');

  var $user = $('#empty-user').clone();
  $user.find('.user-name').text(nick);
  $(users).append($user);
  $user.show();
}

MucUi.fn.sendTopicNotification = function(nick, topic, printNotification) {
  var newStr = nick+" changed room topic to: "+topic;

  if (printNotification) {
    this.appendNotification(newStr, gui.notifications.topic);
  }

  this.topicDiv.text(topic);
}

MucUi.fn.topicHistoryHandler = function(from, topic) {
  var nick = Strophe.getResourceFromJid(from);
  this.sendTopicNotification(nick, topic, false);
}

MucUi.fn.topicHandler = function(topic) {
  var that = this;
  topic.replace(/(.+) has set the subject to: (.+)/gi, function(topic, grp1, grp2) {
    that.sendTopicNotification(grp1, grp2, true);
  });
}

MucUi.fn.topicChangeHandler = function(from, topic) {
  var nick = Strophe.getResourceFromJid(from);
  this.sendTopicNotification(nick, topic, true);
}
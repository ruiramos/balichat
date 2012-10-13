var MucUi = function(connection, jid, nick) {
  var muc = {}; // make muc an object from the start. Needed by muc.window_focused focus tracking.
  var that = this;
  var handlers = {};
  var roster = $('#user-list-'+Strophe.getNodeFromJid(jid));
  this.topicDiv = $('#muc-'+Strophe.getNodeFromJid(jid)+' h2.topic');

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

MucUi.fn.appendToMuc = function() {
  return this.api;
}

MucUi.fn.appendToMuc = function(element, isOwnMessage) {
  var scrollBottom = true;

  if (this.api.getPercentScrolledY() != 1) {
    scrollBottom = false;
  }

  $('.chat-muc-messages').append(element)
  this.updateChatWindow();

  if (scrollBottom == true || isOwnMessage) {
    this.scrollBottom();
  }
}

MucUi.fn.appendMessage = function(nick, message) {
  var from = $(message).attr('from');
  var text = $(message).find('body').text();

  var element = "<p><span>&lt;"+nick+"&gt;</span> "+text+"</p>";
  this.appendToMuc(element, Jabber.isOwnMessage(message));
}

MucUi.fn.appendNotification = function(text, type) {
  var element = "<p class='notification'>"+text+"</p>";
  this.appendToMuc(element, false);
}

MucUi.fn.updateChatWindow = function() {
  this.api.reinitialise();
}

MucUi.fn.scrollBottom = function() {
  this.api.scrollToPercentY(100, false);
}

MucUi.fn.joinHandler = function(stanza, muc, nick, text) {
  //if (this.roster) {
  //  var rosteritem = document.createElement("div");
  //  rosteritem.setAttribute("class", "rosteritem");
  //  rosteritem.innerHTML = "<span class='statusindicator'>&bull;</span>&nbsp;<span>" + gui.htmlescape(nick) + "</span>";
//
  //  var nicks = roster.childNodes;
  //  var added = false;
//
  //  for (var i = 0; i<nicks.length; i++) {
  //    if (nicks[i].nodeType == 1) {
  //      var thisnick = nicks[i].childNodes[2].childNodes[0].nodeValue;
  //      if (thisnick.toLowerCase() > nick.toLowerCase()) {
  //        roster.insertBefore(rosteritem, nicks[i]);
  //        added = true;
  //        break;
  //      }
  //    }
  //  }
//
  //  if (!added) {
  //    roster.appendChild(rosteritem);
  //  }
  //  muc.occupants[nick].rosteritem = rosteritem;
  //}

  this.appendNotification(nick + " joined the room.", gui.notifications.join);
}

MucUi.fn.leaveHandler = function(stanza, muc, nick, text) {
  this.appendNotification(nick + " left the room.", gui.notifications.leave);
}

MucUi.fn.messageHandler = function(stanza, muc, nick, message) {
  //if (options.detect_focus && !muc.window_focused) {
  //  muc.unread_messages++;
  //  document.title = " ("+muc.unread_messages+") " + original_title;
  //}
  this.appendMessage(nick, stanza);
}

MucUi.fn.sendTopicNotification = function(nick, topic) {
  var newStr = nick+" changed room topic to: "+topic;
  that.appendNotification(newStr, gui.notifications.topic);
  that.topicDiv.text(topic);
}

MucUi.fn.topicHandler = function(topic) {
  console.log("TOPIC HANDLER");
  var that = this;
  topic.replace(/(.+) has set the subject to: (.+)/gi, function(topic, grp1, grp2) {
    that.sendTopicNotification(grp1, grp2);
  });
}

MucUi.fn.topicChangeHandler = function(nick, topic) {
  console.log("TOPIC CHANGE HANDLER");
  that.sendTopicNotification(nick, topic);
}
var MucUi = function(connection, jid, nick) {
  var muc = {}; // make muc an object from the start. Needed by muc.window_focused focus tracking.
  var handlers = {};
  var roster = $('#user-list-'+Strophe.getNodeFromJid(jid));

  var scrollDiv = $('#muc-'+Strophe.getNodeFromJid(jid));
  var api = scrollDiv.data('jsp');

  // Handle events
  handlers.handle_join = MucUi.fn.handleJoin;

  muc = new Muc();
  muc.createMucHandler(jid, nick, handlers);
  muc.unread_messages = 0;
  muc.window_focused = true;
  muc.hide_slash_warning = false;

  window.muc = muc;
  return muc;
}

MucUi.fn = MucUi.prototype;

MucUi.fn.appendToMuc = function(element) {
  var scrollBottom = true;

  if (this.api.getPercentScrolledY() != 1) {
    scrollBottom = false;
  }

  $('.chat-muc-messages').append("<p><span>&lt;"+from+"&gt;</span> "+text+"</p>")
  this.updateChatWindow();

  if (scrollBottom == true || from == Strophe.getBareJidFromJid(jabber.jid)) {
    this.scrollBottom();
  }
}

MucUi.fn.appendMessage = function(from, text) {

}

MucUi.fn.appendNotification = function(text, type) {
  var scrollBottom = true;

  if (this.api.getPercentScrolledY() != 1) {
    scrollBottom = false;
  }

  $('.chat-muc-messages').append("<p><span>&lt;"+from+"&gt;</span> "+text+"</p>")
  this.updateChatWindow();

  if (scrollBottom == true || from == Strophe.getBareJidFromJid(jabber.jid)) {
    this.scrollBottom();
  }
}

MucUi.fn.updateChatWindow = function() {
  this.api.reinitialise();
}

MucUi.fn.scrollBottom = function() {
  this.api.scrollToPercentY(100, false);
}

MucUi.fn.handleJoin = function (stanza, muc, nick, text) {
  if (this.roster) {
    var rosteritem = document.createElement("div");
    rosteritem.setAttribute("class", "rosteritem");
    rosteritem.innerHTML = "<span class='statusindicator'>&bull;</span>&nbsp;<span>" + gui.htmlescape(nick) + "</span>";

    var nicks = roster.childNodes;
    var added = false;

    for (var i = 0; i<nicks.length; i++) {
      if (nicks[i].nodeType == 1) {
        var thisnick = nicks[i].childNodes[2].childNodes[0].nodeValue;
        if (thisnick.toLowerCase() > nick.toLowerCase()) {
          roster.insertBefore(rosteritem, nicks[i]);
          added = true;
          break;
        }
      }
    }

    if (!added) {
      roster.appendChild(rosteritem);
    }
    muc.occupants[nick].rosteritem = rosteritem;
  }

  console.log(nick, " has joined");
}
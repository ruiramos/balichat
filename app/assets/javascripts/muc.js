var Muc = function(ui, jid, nick) {
  this.ui = ui;  
  this.jid = jid;
  this.nick = nick;

  this.createMucHandler();
  this.showJoins = false; // used to know when the user stoped receiving history
}

Muc.fn = Muc.prototype;

Muc.fn.sendMessage = function(text) {
  var message = $msg({to: this.jid, from: jabber.jid, type: 'groupchat'}).c('body').t(text);
  connection.send(message);

  return true;
}

Muc.fn.createMucHandler = function() { 
  var muc = {
    connection: connection, jid: this.jid, nick: this.nick,
    occupants: {}
  };
  
  connection.addHandler(this.joinHandler(this.ui, muc), null, "presence", null, null, null);
  connection.addHandler(this.leaveHandler(this.ui, muc), null, "presence", null, null, null);
  connection.addHandler(this.messageHandler(this.ui, muc), null, "message", "groupchat", null, null);
  connection.addHandler(this.historyHandler(this.ui, muc), null, "message", "groupchat", null, null);
  connection.addHandler(this.topicHistoryHandler(this.ui, muc), null, "message", "groupchat", null, null);
  connection.addHandler(this.topicChangeHandler(this.ui, muc), null, "message", "groupchat", null, null);
  // TODO: not done yet
  //connection.addHandler(this.errorHandler(this.ui, muc), null, "presence", "error", null, null);

  // Join the muc.
  // Params: room, nick, msg_handler_cb, pres_handler_cb, roster_cb, password
  connection.muc.join(this.jid, this.nick, null, null, null, null);

  return muc;
}

Muc.fn.joinHandler = function(ui, muc) {
  var that = this;
  return function (stanza) {
    var $stanza = $(stanza);
    var nick = Strophe.getResourceFromJid($stanza.attr("from"));
    if ($stanza.attr("type") != "unavailable" && $stanza.attr("type") != "error"
      && Strophe.getBareJidFromJid($stanza.attr("from")) == muc.jid) {
      if (!muc.occupants[nick]) {
        var text = $stanza.find("status")[0];
        if (text) text = Strophe.getText(text);
        muc.occupants[nick] = {};

        if (that.showJoins == true) {
          ui.joinHandler(stanza, muc, nick, text);
        } else {
          ui.mucRosterHandler(stanza, muc, nick, text);
        }

        if (muc.status_handler) {
          muc.status_handler(stanza);
        }

        // If i received my own presence then show joins from here on!
        if (Strophe.getBareJidFromJid(nick) == Strophe.getBareJidFromJid(jabber.jid)) {
          that.showJoins = true;
        }
      }
    }

    return true;
  };
}

Muc.fn.leaveHandler = function(ui, muc) {
  return function (stanza) {
    var $stanza = $(stanza);
    var nick = Strophe.getResourceFromJid($stanza.attr("from"));
    if ($stanza.attr("type") == "unavailable" && Strophe.getBareJidFromJid($stanza.attr("from")) == muc.jid) {
      if (muc.occupants[nick]) {
        var text = $stanza.find("status")[0];
        if (text) text = Strophe.getText(text);
        ui.leaveHandler(stanza, muc, nick, text);
        muc.occupants[nick] = null;
      }
    }

    return true;
  };
}

Muc.fn.messageHandler = function(ui, muc) {
  return function (stanza) {
    var $stanza = $(stanza);
    if ($stanza.attr("type") == "groupchat" && Strophe.getBareJidFromJid($stanza.attr("from")) == muc.jid) {
      var body = $stanza.find("body");
      if (body.length > 0 && $stanza.find("delay").length == 0 && $stanza.find("subject").length == 0) {
        ui.messageHandler(stanza, muc, Strophe.getResourceFromJid($stanza.attr("from")), Strophe.getText(body[0]));
      }
    }

    return true;
  };
}

Muc.fn.historyHandler = function(ui, muc) {
  return function (stanza) {
    var $stanza = $(stanza);
    if ($stanza.attr("type") == "groupchat" && Strophe.getBareJidFromJid($stanza.attr("from")) == muc.jid) {
      var body = $stanza.find("body");
      if (body.length > 0 && $stanza.find("delay").length > 0) {
        ui.historyHandler(stanza, muc, Strophe.getResourceFromJid($stanza.attr("from")), Strophe.getText(body[0]));
      }
    }

    return true;
  };
}

Muc.fn.topicHistoryHandler = function(ui, muc) {
  var that = this;
  return function (stanza) {
    var $stanza = $(stanza);
    if ($stanza.attr("type") == "groupchat" && Strophe.getBareJidFromJid($stanza.attr("from")) == muc.jid) {
      var body = $stanza.find("body");
      if (body.length == 0 && $stanza.find("delay").length > 0 && $stanza.find("subject").length > 0) {
        ui.topicHistoryHandler($stanza.attr("from"), $stanza.find("subject").text());
      }
    }

    return true;
  };
}

Muc.fn.topicChangeHandler = function(ui, muc) {
  var that = this;
  return function (stanza) {
    var $stanza = $(stanza);
    if ($stanza.attr("type") == "groupchat" && Strophe.getBareJidFromJid($stanza.attr("from")) == muc.jid) {
      var body = $stanza.find("body");
      if (body.length == 0 && $stanza.find("delay").length == 0 && $stanza.find("subject").length > 0) {
        ui.topicChangeHandler($stanza.attr("from"), $stanza.find("subject").text());
      }
    }

    return true;
  };
}
// TODO: not getting errors yet
//Muc.fn.errorHandler = function(muc, callback) {
//  return function (stanza) {
//
//    if (Strophe.getBareJidFromJid(stanza.getAttribute("from")) == muc.jid) {
//      var e = stanza.getElementsByTagName("error");
//      if (e.length > 0) {
//        var err = null;
//        Strophe.forEachChild(e[0], null, function (child) {
//          if (child.getAttribute("xmlns") == "urn:ietf:params:xml:ns:xmpp-stanzas") {
//            err = child.nodeName;
//          }
//        });
//
//        callback(stanza, muc, err);
//      }
//    }
//
//    return true;
//  };
//}
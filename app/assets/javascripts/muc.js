var Muc = function(ui, jid, nick) {
  this.ui = ui;  
  this.jid = jid;
  this.nick = nick;

  this.createMucHandler();
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
  connection.addHandler(this.topicHandler(this.ui, muc), null, "message", "groupchat", null, null);
  connection.addHandler(this.topicChangeHandler(this.ui, muc), null, "message", "groupchat", null, null);
  
  //if (options.handle_leave) {
  //  connection.addHandler(Muc.fn.new_leave_handler(muc, options.handle_leave), null, "presence", null, null, null);
  //}
//
  //if (options.handle_status) {
  //  // This one is called internally, so we need to store a reference to it
  //  muc.status_handler = new_status_handler(muc, options.handle_status);
  //  connection.addHandler(muc.status_handler, null, "presence", null, null, null);
  //}
//
  //if (options.handle_history) {
  //  connection.addHandler(Muc.fn.new_history_handler(muc, options.handle_history), null, "message", "groupchat", null, null);
  //}
//
  //if (options.handle_message) {
  //  connection.addHandler(Muc.fn.new_message_handler(muc, options.handle_message), null, "message", "groupchat", null, null);
  //}
//
  //if (options.handle_error) {
  //  connection.addHandler(Muc.fn.new_error_handler(muc, options.handle_error), null, "presence", "error", null, null);
  //}

  muc.set_status = function (status, text) {
    var pres = $pres({to: this.jid+'/'+this.nick});
    if (status && status != "online") {
      pres.c("show").t(status).up();
    }

    if (text) {
      pres.c("status").t(text).up();
    }
    connection.send(pres.tree());
  };

  muc.set_status("online");

  return muc;
}

Muc.fn.joinHandler = function(ui, muc) {  
  return function (stanza) {
    var $stanza = $(stanza);
    var nick = Strophe.getResourceFromJid($stanza.attr("from"));
    if ($stanza.attr("type") != "unavailable" && $stanza.attr("type") != "error"
      && Strophe.getBareJidFromJid($stanza.attr("from")) == muc.jid) {
      if (!muc.occupants[nick]) {
        var text = $stanza.find("status")[0];
        if (text) text = Strophe.getText(text);
        muc.occupants[nick] = {};
        ui.joinHandler(stanza, muc, nick, text);

        if (muc.status_handler) {
          muc.status_handler(stanza);
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
        // TODO: for now we will just ignore history messages
      }
    }

    return true;
  };
}

Muc.fn.topicHandler = function(ui, muc) {
  return function (stanza) {
    var $stanza = $(stanza);
    if ($stanza.attr("type") == "groupchat" && Strophe.getBareJidFromJid($stanza.attr("from")) == muc.jid) {
      var body = $stanza.find("body");
      if (body.length > 0 && $stanza.find("delay").length == 0 && $stanza.find("subject").length > 0) {
        console.log("::::::: TOPICHANDLER BROTHER");
        ui.topicHandler(Strophe.getText(body[0]));
      }
    }

    return true;
  };
}

Muc.fn.topicChangeHandler = function(ui, muc) {
  return function (stanza) {
    var $stanza = $(stanza);
    if ($stanza.attr("type") == "groupchat" && Strophe.getBareJidFromJid($stanza.attr("from")) == muc.jid) {
      var body = $stanza.find("body");
      if (body.length == 0 && $stanza.find("delay").length == 0 && $stanza.find("subject").length > 0) {
        console.log("::::::::: AQUI");
        ui.topicChangeHandler($stanza.attr("from"), $stanza.find("subject").text());
      }
    }

    return true;
  };
}

Muc.fn.new_error_handler = function(muc, callback) {
  return function (stanza) {

    if (Strophe.getBareJidFromJid(stanza.getAttribute("from")) == muc.jid) {
      var e = stanza.getElementsByTagName("error");
      if (e.length > 0) {
        var err = null;
        Strophe.forEachChild(e[0], null, function (child) {
          if (child.getAttribute("xmlns") == "urn:ietf:params:xml:ns:xmpp-stanzas") {
            err = child.nodeName;
          }
        });

        callback(stanza, muc, err);
      }
    }

    return true;
  };
}

Muc.fn.new_status_handler = function(muc, callback) {
  return function (stanza) {
    var nick = Strophe.getResourceFromJid(stanza.getAttribute("from"));
    if (stanza.getAttribute("type") != "unavailable" && stanza.getAttribute("type") != "error"
      && Strophe.getBareJidFromJid(stanza.getAttribute("from")) == muc.jid) {

      if (muc.occupants[nick]) {
        var status = stanza.getElementsByTagName("show")[0];
        var text = stanza.getElementsByTagName("status")[0];
        if (!status)
          status = "online";
        else
          status = Strophe.getText(status);
        if (text) text = Strophe.getText(text);
        if (status != muc.occupants[nick].status || text != muc.occupants[nick].status_text) {
          muc.occupants[nick].status = status;
          muc.occupants[nick].status_text = text;
          callback(stanza, muc, nick, status, text);
        }
      }
    }

    return true;
  };
}
var Jabber = function() {
  this.BOSH_SERVICE = "/http-bind";
  this.connection = null;
  this.jid = null;
};

Jabber.fn = Jabber.prototype;

Jabber.fn.onAttach = function(status) {
  if (status == Strophe.Status.DISCONNECTED) {
    console.log('Disconnected.');
  }
  else if (status == Strophe.Status.ATTACHED) {
    console.log('Strophe is attached.');
  }
  connection.send($pres().tree());
  connection.addHandler(Jabber.fn.onMessage, null, 'message', null, null, null);
}

Jabber.fn.onMessage = function(message) {
  var text = $(message).find('body').text();
  var from = $(message).attr('from');
  
  Ui.appendMessage(from, text);

  return true;
}

Jabber.fn.sendMessage = function(jid, text) {
  var message = $msg({to: jid, from: this.jid, type: 'chat'}).c('body').t(text);
  connection.send(message.tree());

  Ui.appendMessage(this.jid, text);

  return true;
}

Jabber.fn.sendGroupMessage = function(jid, text) {
  var message = $msg({to: jid, from: this.jid, type: 'groupchat'}).c('body').t(text);
  connection.send(message.tree());

  Ui.appendMessage(this.jid, text);

  return true;
}

Jabber.fn.connect = function(jid, sid, rid) {
  connection = new Strophe.Connection(this.BOSH_SERVICE);
  
  connection.rawInput = function (data) {
    console.log('RAW_IN: ' + data);
  };
  
  //connection.rawOutput = function (data) {
  //  console.log('SENT: ' + data);
  //};

  // uncomment for extra debugging
  // Strophe.log = function (lvl, msg) { console.log(msg); };
  this.jid = jid;
  connection.attach(jid, sid, rid, this.onAttach);

  muc = Jabber.fn.create_muc_handler('amizade@conference.pylon.local', jid);
  muc.send_message('PUTAS');
}

Jabber.fn.create_muc_handler = function(jid, nick, options) {
  if (typeof(options) == "undefined" || !options) {
    options = {};
  }

  var muc = {
    connection: connection, jid: jid, nick: nick, options: options,
    send_message: function (text) {
      connection.send($msg({to: jid, type: 'groupchat'}).c('body').t(text).tree());
    },
    occupants: {}
  };

  if (options.handle_join) {
    connection.addHandler(Jabber.fn.new_join_handler(muc, options.handle_join), null, "presence", null, null, null);
  }
                
  if (options.handle_leave) {
    connection.addHandler(Jabber.fn.new_leave_handler(muc, options.handle_leave), null, "presence", null, null, null);
  }
                
  if (options.handle_status) {
    // This one is called internally, so we need to store a reference to it
    muc.status_handler = new_status_handler(muc, options.handle_status);
    connection.addHandler(muc.status_handler, null, "presence", null, null, null);
  }
                
  if (options.handle_history) {
    connection.addHandler(Jabber.fn.new_history_handler(muc, options.handle_history), null, "message", "groupchat", null, null);
  }

  if (options.handle_message) {
    connection.addHandler(Jabber.fn.new_message_handler(muc, options.handle_message), null, "message", "groupchat", null, null);
  }

  if (options.handle_error) {
    connection.addHandler(Jabber.fn.new_error_handler(muc, options.handle_error), null, "presence", "error", null, null);
  }
        
  muc.set_status = function (status, text) {
    var pres = $pres({to: jid+'/'+nick});
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

Jabber.fn.new_join_handler = function(muc, callback) {
  return function (stanza) {
    var nick = Strophe.getResourceFromJid(stanza.getAttribute("from"));
    if (stanza.getAttribute("type") != "unavailable" && stanza.getAttribute("type") != "error"
      && Strophe.getBareJidFromJid(stanza.getAttribute("from")) == muc.jid) {
      if (!muc.occupants[nick]) {
        var text = stanza.getElementsByTagName("status")[0];
        if (text) text = Strophe.getText(text);
          muc.occupants[nick] = {};
        callback(stanza, muc, nick, text);
        
        if (muc.status_handler) {
          muc.status_handler(stanza);
        }
      }
    }

    return true;
  };
}

Jabber.fn.new_leave_handler = function(muc, callback) {
  return function (stanza) {
    var nick = Strophe.getResourceFromJid(stanza.getAttribute("from"));
    if (stanza.getAttribute("type") == "unavailable" && Strophe.getBareJidFromJid(stanza.getAttribute("from")) == muc.jid) {
      if (muc.occupants[nick]) {
        var text = stanza.getElementsByTagName("status")[0];
        if (text) text = Strophe.getText(text);
        callback(stanza, muc, nick, text);
        muc.occupants[nick] = null;
      }
    }

    return true;
  };
}

Jabber.fn.new_message_handler = function(muc, callback) {
  return function (stanza) {
    
    if (stanza.getAttribute("type") == "groupchat" && Strophe.getBareJidFromJid(stanza.getAttribute("from")) == muc.jid) {
      var body = stanza.getElementsByTagName("body");
      if (body.length > 0 && stanza.getElementsByTagName("delay").length == 0) {
        callback(stanza, muc, Strophe.getResourceFromJid(stanza.getAttribute("from")), Strophe.getText(body[0]));
      }
    }
    
    return true;
  };
}

Jabber.fn.new_history_handler = function(muc, callback) {
  return function (stanza) {
    if (stanza.getAttribute("type") == "groupchat" && Strophe.getBareJidFromJid(stanza.getAttribute("from")) == muc.jid) {
      var body = stanza.getElementsByTagName("body");
      if (body.length > 0 && stanza.getElementsByTagName("delay").length > 0) {
        callback(stanza, muc, Strophe.getResourceFromJid(stanza.getAttribute("from")), Strophe.getText(body[0]));
      }
    }
    
    return true;
  };
}

Jabber.fn.new_error_handler = function(muc, callback) {
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

Jabber.fn.new_status_handler = function(muc, callback) {
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
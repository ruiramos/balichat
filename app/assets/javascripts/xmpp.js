var Jabber = function() {
  this.BOSH_SERVICE = "/http-bind";
  this.connection = null;
  this.jid = null;

  this.status = {
    online: 'online',
    away: 'away',
    xa: 'xa',
    dnd: 'dnd',
    chat: 'chat',
    unavailable: 'unavailable'
  }
};

Jabber.fn = Jabber.prototype;

Jabber.fn.isOwnMessage = function(message) {
  var from = $(message).attr('from');
  var myNode = Strophe.getNodeFromJid(this.jid);
  return (Strophe.getResourceFromJid(from) == myNode);
}

Jabber.fn.onAttach = function(status) {
  if (status == Strophe.Status.DISCONNECTED) {
    console.log('Disconnected.');
  }
  else if (status == Strophe.Status.ATTACHED) {
    console.log('Strophe is attached.');
  }
  connection.send($pres().tree());
}

Jabber.fn.onMessage = function(message) {
  var text = $(message).find('body').text();
  var from = $(message).attr('from');

  return true;
}

Jabber.fn.sendPrivateMessage = function(jid, text) {
  var message = $msg({to: jid, from: this.jid, type: 'chat'}).c('body').t(text);
  connection.send(message.tree());

  return true;
}

function onConnect(status) {
   if (status == Strophe.Status.CONNECTING) {
  log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
  log('Strophe failed to connect.');
  $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
  log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
  log('Strophe is disconnected.');
  $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
  log('Strophe is connected.');
  xmpp.muc = new MucUi(connection, 'amizade@conference.'+host, Strophe.getNodeFromJid(jid));
    }
  
}

Jabber.fn.connect = function(jid, sid, rid, host) {
  connection = new Strophe.Connection(this.BOSH_SERVICE);
  
  connection.rawInput = function (data) {
    console.log('RAW_IN: ' + data);
  };

  connection.rawOutput = function (data) {
    console.log('SENT: ' + data);
  };

  // Strophe.log = function (lvl, msg) { console.log(msg); };
  this.jid = jid;
  //connection.attach(jid, sid, rid, this.onAttach);
  connection.connect('oterosantos_2a94f4@chat.twintend.com', 'Jjc8hG', onConnect);
}
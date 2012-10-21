var Jabber = function() {
  this.BOSH_SERVICE = "/http-bind";
  this.connection = null;
  this.jid = null;
  this.mucAddress = null;

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
  this.muc = new MucUi(connection, this.mucAddress, Strophe.getNodeFromJid(this.jid));
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
  this.mucAddress = 'amizade@conference.'+host;
  connection.attach(jid, sid, rid, this.onAttach);
}
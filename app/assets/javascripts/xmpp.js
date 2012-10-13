var Jabber = function() {
  this.BOSH_SERVICE = "/http-bind";
  this.connection = null;
  this.jid = null;
  this.muc = null;
};

Jabber.fn = Jabber.prototype;

Jabber.isOwnMessage = function(message) {
  var from = $(message).attr('from');
  return (Strophe.getBareJidFromJid(from) == this.jid);
}

Jabber.fn.onAttach = function(status) {
  if (status == Strophe.Status.DISCONNECTED) {
    console.log('Disconnected.');
  }
  else if (status == Strophe.Status.ATTACHED) {
    console.log('Strophe is attached.');
  }
  connection.send($pres().tree());
  //connection.addHandler(Jabber.fn.onMessage, null, 'message', null, null, null);
}

Jabber.fn.onMessage = function(message) {
  var text = $(message).find('body').text();
  var from = $(message).attr('from');
  
  gui.appendMucMessage(from, text);

  return true;
}

Jabber.fn.sendMessage = function(jid, text) {
  var message = $msg({to: jid, from: this.jid, type: 'chat'}).c('body').t(text);
  connection.send(message.tree());

  gui.appendMessage(this.jid, text);

  return true;
}

Jabber.fn.connect = function(jid, sid, rid) {
  connection = new Strophe.Connection(this.BOSH_SERVICE);
  
  //connection.rawInput = function (data) {
  //  console.log('RAW_IN: ' + data);
  //};
  
  //connection.rawOutput = function (data) {
  //  console.log('SENT: ' + data);
  //};

  // uncomment for extra debugging
  // Strophe.log = function (lvl, msg) { console.log(msg); };
  this.jid = jid;
  connection.attach(jid, sid, rid, this.onAttach);

  this.muc = new MucUi(connection, 'amizade@conference.pylon.local', jid);
}
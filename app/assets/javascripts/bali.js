/* Copyright (c) 2012 Twintend (http://twintend.com)
 *
 * Main class of the application. This will have the xmpp client
 * and top level operations like connect and disconnect. Is also
 * the class from which you can access all the mucs, participants, etc.
 *
 */
var Bali = function() {
  this.BOSH_SERVICE = "/http-bind";
  this.client = null;
  this.jid = null;

  this.ui = new BaliUi();

  // List of mucs where the client is participating
  this.mucList = [];

  // Set this to true to check all the sent and received stanzas on console.
  this.debug = false
};

Bali.fn = Bali.prototype;

Bali.fn.isOwnMessage = function(message) {
  var from = $(message).attr('from');
  var myNode = Strophe.getNodeFromJid(this.jid);
  return (Strophe.getResourceFromJid(from) == myNode);
}

Bali.fn.getActiveMuc = function() {
  var activeMuc = null;

  $.each(this.mucList, function(i, m) {
    // TODO: returning the correct muc. for now return the only muc there is.
    activeMuc = m;
    return;
  });

  return activeMuc;
}

Bali.fn.connect = function(jid, sid, rid, host) {
  this.client = new Strophe.Connection(this.BOSH_SERVICE);

  if (this.debug) {
    this.client.rawInput = function (data) { console.log('RAW_IN: ' + data) };
    this.client.rawOutput = function (data) { console.log('SENT: ' + data) };
    // For extreme debug.
    // Strophe.log = function (lvl, msg) { console.log(msg); };
  }

  this.jid = jid;

  this.client.attach(jid, sid, rid, function(status) {
    if (status == Strophe.Status.DISCONNECTED) {
      console.log('Disconnected.');
    }
    else if (status == Strophe.Status.ATTACHED) {
      console.log('Strophe is attached.');
    }
  });

  var amizadeMuc = new Muc(this.client, 'amizade@conference.'+host)
  this.mucList.push(amizadeMuc);
  amizadeMuc.join(Strophe.getNodeFromJid(jid));
}

Bali.escapeHtml = function(text) {
  return text.replace(/&/g,'&amp;').
              replace(/>/g,'&gt;').
              replace(/</g,'&lt;').
              replace(/"/g,'&quot;');
}
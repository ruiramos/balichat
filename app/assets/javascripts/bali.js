/* Copyright (c) 2012 Twintend (http://twintend.com)
 *
 * Main class of the application. This will have the xmpp client
 * and top level operations like connect and disconnect. Is also
 * the class from which you can access all the mucs, participants, etc.
 *
 */
var Bali = (function() {
  var BOSH_SERVICE = "/http-bind";
  var client = null;
  var jid = null;

  // List of mucs where the client is participating
  var mucList = [];

  // Set this to true to check all the sent and received stanzas on console.
  var debug = false;
  
  // Public methods
  return {
    isOwnMessage: function(message) {
      var from = $(message).attr('from');
      var myNode = Strophe.getNodeFromJid(jid);
      
      return (Strophe.getResourceFromJid(from) == myNode);
    },
    
    getActiveMuc: function() {
      var activeMuc = null;
      $.each(mucList, function(i, m) {
        // TODO: return the correct muc. for now return the only muc there is.
        activeMuc = m;
        return;
      });

      return activeMuc;
    },

    connect: function(jid, sid, rid, host) {
      client = new Strophe.Connection(BOSH_SERVICE);

      if (debug) {
        this.client.rawInput = function (data) { console.log('RAW_IN: ' + data) };
        this.client.rawOutput = function (data) { console.log('SENT: ' + data) };
        // For extreme debug.
        // Strophe.log = function (lvl, msg) { console.log(msg); };
      }

      this.jid = jid;
      client.attach(jid, sid, rid, function(status) {
        if (status == Strophe.Status.DISCONNECTED) {
          console.log('Disconnected.');
        }
        else if (status == Strophe.Status.ATTACHED) {
          console.log('Strophe is attached.');
        }
      });

      // TODO: join correct mucs
      var amizadeMuc = new Muc(client, 'amizade@conference.'+host)
      mucList.push(amizadeMuc);
      amizadeMuc.join(Strophe.getNodeFromJid(jid));
    },

    escapeHtml: function(text) {
      return text.replace(/&/g,'&amp;').replace(/>/g,'&gt;').
      replace(/</g,'&lt;').replace(/"/g,'&quot;');
    }
  }
}());
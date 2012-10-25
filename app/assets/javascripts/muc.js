/* Copyright (c) 2012 Twintend (http://twintend.com)
 *
 * This is the class that manages one muc (Multi User Chat).
 *
 * The muc is identified by a jid address, (eg: room_name@conference.server.com)
 * and all the participants will be resources of this jid
 * (eg: room_name@conference.server.com/nickname).
 *
 */
var Muc = function(client, jid) {
  // The client Strophe connection
  this.client = client;

  this.jid = jid;
  this.roomName = Strophe.getNodeFromJid(jid);

  // Number of unread messages on this muc.
  this.unreadMessages = 0;

  // Array of Participant objects.
  this.participants = [];

  // Used to know when the user stoped receiving backlog, which is basically
  // when the user receives his own presence stanza.
  this.showJoins = false;

  // When did we start joining this muc. This is usefull to know which messages
  // are backlog without having to do much.
  this.joinedTimeStamp = '';

  // Add a Muc interface to this muc.
  this.ui = new MucUi(this);

  // Balichat client nick.
  this.myNick = '';

  // Balichat client participant.
  this.me = null;
}

Muc.fn = Muc.prototype;

// Joins the muc with given nickname.
Muc.fn.join = function(nick) {
  var thisMuc = this;
  this.myNick = nick;
  this.joinedTimeStamp = moment().format("YYYY-MM-DDTHH:mm:ss");
  this.client.muc.join(this.jid, nick,
    function(msg) {
      if (thisMuc.handleMessage(msg)) {
        return true;
      }
    },
    function(pres) {
      if (thisMuc.handlePresence(pres)) {
        return true;
      }
    }
  );
}

// Send a group message to the room and returns the unique id.
Muc.fn.sendMessage = function(text) {
  var id = this.client.muc.groupchat(this.jid, text);
  this.ui.handleMessage(this.me, text);

  return id;
}

Muc.fn.setTopic = function(text) {
  text = Bali.escapeHtml(text);
  this.client.muc.setTopic(this.jid, text);
}

Muc.fn.addParticipant = function(jid) {
  var participant = this.getParticipant(jid);

  if (participant == null) {
    participant = new Participant(jid);
    this.participants.push(participant);
  }

  return participant;
}

Muc.fn.removeParticipant = function(participant) {
  var i = this.participants.indexOf(participant);
  this.participants.splice(i,1);
}

Muc.fn.getParticipant = function(jid) {
  var participant = null;

  $.each(this.participants, function(i, p) {
    if (p.jid === jid) {
      participant = p;
      return;
    }
  });

  return participant;
}

Muc.fn.getParticipantByNick = function(nick) {
  var participant;

  $.each(this.participants, function(i, p) {
    if (p.nick === nick) {
      participant = p;
      return;
    }
  });

  return participant;
}

Muc.fn.handleMessage = function(msg) {
  var type = $(msg).attr('type');
  var from = $(msg).attr('from');
  var delay = $(msg).find('delay');
  var subject = $(msg).find('subject');
  var nick = Strophe.getResourceFromJid(from);
  var participant = this.getParticipantByNick(nick);

  if (type == 'groupchat' && Strophe.getBareJidFromJid(from) == this.jid) {
    var body = $(msg).find('body');
    if (body.length > 0) {
      if (delay.length == 0 && nick != this.myNick) {
        if (nick == null) {
          console.log("handleTopicBacklog");
          console.log(msg);
          this.ui.handleTopicBacklog(participant, subject.text());
        } else {
          console.log("handleMessage");
          console.log(msg);
          this.ui.handleMessage(participant, body.text());
        }
      }
      if (delay.length > 0) {
        var timestamp = delay.attr('stamp');
        console.log("handleTimedMessage");
        console.log(msg);
        // When getting backlog I can get messages from people that are not in
        // the room anymore. In this case we have to create a temporary one.
        participant = new Participant(from);
        this.ui.handleTimedMessage(participant, body.text(), timestamp);
      }
    }
    else if (body.length == 0 && subject.length > 0) {
      if (delay.length > 0) {
        console.log("handleTopicBacklog");
        console.log(msg);
        this.ui.handleTopicBacklog(participant, subject.text());
      }
      if (delay.length == 0) {
        console.log("handleTopicChange");
        console.log(msg);
        this.ui.handleTopicChange(participant, subject.text());
      }
    }
  }

  return true;
}

Muc.fn.handlePresence = function(pres) {
  var type = $(pres).attr('type');
  var from = $(pres).attr('from');
  var status = $(pres).find('show');
  var nick = Strophe.getResourceFromJid(from);
  var participant = this.getParticipantByNick(nick);
  var newParticipant = false;

  if (participant == null) {
    participant = this.addParticipant(from);
    newParticipant = true;
  }

  participant.setStatus(status.text());

  // Error logging in
  if (type === 'error') {
    if ($(pres).find('error').attr('code') === '409') {
      // TODO: login error!!!
      return false;
    }
    return true;
  }

  // Detect nickname change.
  if ($(pres).find('status').attr('code') === '303') {
    var newNick = $(pres).find('item').attr('nick');
    participant.changeNick(newNick);
    this.ui.handleNickChange(participant, nick, newNick);
    return true;
  }

  // Detect participant presence.
  if (type === 'unavailable') {
    this.ui.handleLeave(participant);
    this.removeParticipant(participant);
    return true;
  }
  else {
    this.client.vcard.get(function(stanza) {
      participant.setVcard(stanza);
    }, participant.jid);

    if (this.showJoins) {
      if (newParticipant) {
        this.ui.handleJoin(participant);
      } else {
        this.ui.handlePresence(participant);
      }
    } else {
      this.ui.handleStartParticipant(participant);
    }

    // If i received my own presence then show joins from here on!
    if (nick == this.myNick) {
      this.showJoins = true;
      this.me = participant;
    }
  }

  return true;
}
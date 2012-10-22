function vCard() {
  this.familyName = "";
  this.givenName = "";
  this.photo = { MIME: null, binValue: null };
}

function Participant(jid) {
  this.vcard = new vCard();
  this.jid = jid;
  this.nick = Strophe.getResourceFromJid(jid);
  this.status = jabber.status.offline;
}

Participant.fn = Participant.prototype;

Participant.fn.setVcard = function(stanza) {
  var vc = $(stanza).find('vCard');
  this.vcard.familyName = $(vc).find('FN').text();
  this.vcard.photo.MIME = $(vc).find('PHOTO').find('TYPE').text();
  this.vcard.photo.binValue = $(vc).find('PHOTO').find('BINVAL').text();
}

Participant.fn.avatar = function() {
  return "data:"+this.vcard.photo.MIME+";base64,"+this.vcard.photo.binValue;
}
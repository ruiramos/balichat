function vCard() {
  this.familyName = "";
  this.givenName = "";
  this.photo = { MIME: null, binValue: null };
}

function Participant(jid) {
  this.vcard = new vCard();
  this.jid = jid;
  this.nick = Strophe.getResourceFromJid(jid);
  this.dom = this.buildDomElement();
  this.status = 'unavailable';
  this.setStatus(this.status);
}

Participant.fn = Participant.prototype;

Participant.fn.setVcard = function(stanza) {
  var vc = $(stanza).find('vCard');

  this.vcard.familyName = $(vc).find('FN').text();
  this.vcard.photo.MIME = $(vc).find('PHOTO').find('TYPE').text();
  this.vcard.photo.binValue = $(vc).find('PHOTO').find('BINVAL').text();
  if (this.vcard.photo.MIME != '' && this.vcard.photo.binValue != '') {
    this.dom.find('.userimg').css('background', this.avatar());
  }
}

Participant.fn.avatar = function() {
  if (this.vcard.photo.binValue == null || this.vcard.photo.binValue == '') {
    return 'url("/assets/default-avatar.png")';
  } else {
    var binValue = this.vcard.photo.binValue.replace(/\n/g, '');
    return 'url("data:'+this.vcard.photo.MIME+';base64,'+binValue+'")';
  }
}

Participant.fn.changeNick = function(newNick) {
  this.nick = newNick;
  this.jid = this.jid.replace(/\/\w+/, '/'+newNick);
}

Participant.fn.buildDomElement = function(dom) {
  var dom = $('#empty-user').clone();

  dom.removeAttr('id');
  dom.attr('title', this.nick);
  dom.removeClass('hide');
  dom.find('.user-name').text(this.nick);
  dom.show();

  return dom;
}

Participant.fn.setStatus = function(type) {
  type = (type == '') ? 'online' : type;

  this.dom.removeClass();
  this.dom.addClass('user');
  this.dom.addClass(type);

  this.status = type;
}

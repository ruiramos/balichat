var vCard = function() {
  this.familyName = "";
  this.givenName = "";
  this.photo = { MIME: null, binValue: null };
}

var Participant = function(fullJid) {
  var vcard = new vCard(),
      jid = fullJid,
      nick = Strophe.getResourceFromJid(jid),
      domRoot = $('#empty-user').clone(),
      status = 'unavailable';

  return {
    setVcard: function(stanza) {
      var vc = $(stanza).find('vCard');
      vcard.familyName = $(vc).find('FN').text();
      vcard.photo.MIME = $(vc).find('PHOTO').find('TYPE').text();
      vcard.photo.binValue = $(vc).find('PHOTO').find('BINVAL').text();

      if (vcard.photo.MIME != '' && vcard.photo.binValue != '') {
        domRoot.find('.userimg').css('background', this.avatar());
      }
    },

    avatar: function() {
      if (vcard.photo.binValue == null || vcard.photo.binValue == '') {
        return 'url("/assets/default-avatar.png")';
      } else {
        var binValue = vcard.photo.binValue.replace(/\n/g, '');
        return 'url("data:'+vcard.photo.MIME+';base64,'+binValue+'")';
      }
    },
    
    getJid: function() {
      return jid;
    },

    getNick: function() {
      return nick;
    },

    changeNick: function(newNick) {
      nick = newNick;
      jid = jid.replace(/\/\w+/, '/'+newNick);
    },

    buildDomElement: function() {
      domRoot.removeAttr('id');
      domRoot.attr('title', nick);
      domRoot.removeClass('hide');
      domRoot.find('.user-name').text(nick);
      domRoot.show();
    },

    getDom: function() {
      return domRoot;
    },

    setStatus: function(type) {
      type = (type == '') ? 'online' : type;

      domRoot.removeClass();
      domRoot.addClass('user');
      domRoot.addClass(type);

      status = type;
    },

    getStatus: function() {
      return status;
    },
  };
}

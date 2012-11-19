/* Copyright (c) 2012 Twintend (http://twintend.com)
 *
 * This is the class that represents a message in the chatroom.
 *
 */
var ChatMessage = function(muc, participant, text, timestamp) {
  this.muc = muc;
  this.participant = participant;
  this.text = Bali.escapeHtml(text);
  this.text = this.text.replace(/\n/g, "<br>");

  this.timestamp = timestamp;
  this.isParagraph = false;

  this.dom = this.buildAsDiv();
}

ChatMessage.fn = ChatMessage.prototype;

ChatMessage.fn.isOwnMessage = function() {
  return this.muc.myNick === this.participant.getNick();
}

ChatMessage.fn.isBacklog = function() {
  if (this.timestamp != '') {
    return (moment(this.timestamp).diff(moment(this.muc.joinedTimeStamp))) < 0;
  }

  return false;
}

ChatMessage.fn.buildAsParagraph = function() {
  var paragraph = jQuery('<p/>').html(this.text).addClass('text');
  this.dom = paragraph;
  this.isParagraph = true;
}

ChatMessage.fn.buildAsDiv = function() {
  var el = $('#empty-message').clone();

  el.removeAttr('id');
  el.removeClass('hide');

  if (this.timestamp != null) {
    el.find('.timestamp').text(moment().format(BaliUi.timeFormat));
  } else {
    el.find('.timestamp').text(moment(this.timestamp).format(BaliUi.timeFormat));
  }

  el.find('.nick').text(this.participant.getNick());
  el.find('.text').html(this.text);
  el.find('.avatar-placeholder').css('background-image', this.participant.avatar())

  if (this.isBacklog()) {
    el.find('.message').addClass('old');
  }

  if (this.isOwnMessage()) {
    el.find('.message').addClass('own');
  }

  el.show();

  return el;
}
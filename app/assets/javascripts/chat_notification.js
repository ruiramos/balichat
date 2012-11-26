/* Copyright (c) 2012 Twintend (http://twintend.com)
 *
 * This is the class that represents a notification in the chatroom.
 *
 */
var ChatNotification = function(muc, type, text, timestamp) {
  this.muc = muc;
  this.type = type;
  this.text = text;
  this.timestamp = timestamp;
  this.isParagraph = false;

  this.dom = this.buildDOMElement(type, text, timestamp);
}

ChatNotification.fn = ChatNotification.prototype;

ChatNotification.types = {
  'join': 'user-joins',
  'leave': 'user-leaves',
  'topic': 'topic',
  'notification': 'notification',
  'normal': ''
}

// Methods added just to be compatible with message methods.
ChatNotification.fn.isOwnMessage = function() { return false }
ChatNotification.fn.isBacklog = function() { return false }

ChatNotification.fn.buildDOMElement = function(type, text, timestamp) {
  var el = $('#empty-message').clone();

  el.removeAttr('id');
  el.removeClass('hide');

  if (timestamp != null) {
    el.find('.timestamp').text(moment().format(BaliUi.timeFormat));
  } else {
    el.find('.timestamp').text(moment(timestamp).format(BaliUi.timeFormat));
  }
  el.find('.message').addClass('system').addClass(type)
  el.find('.nick').remove();
  el.find('.avatar-placeholder').remove();
  el.find('.text').html(text);

  el.show();

  return el;
}
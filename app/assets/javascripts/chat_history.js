var ChatHistory = function() {
  this.messages = [];
  this.limit = 50; // how many messages we store in history
  this.currentPosition = 0;
}

ChatHistory.fn = ChatHistory.prototype;

ChatHistory.fn.size = function() {

}

ChatHistory.fn.addMessage = function(text) {
  var size = this.messages.push(text);
  if (size>this.limit) {
    this.shift();
    size = this.limit;
  }
  this.currentPosition = size;
}

ChatHistory.fn.shift = function() {
  this.messages.shift();
}
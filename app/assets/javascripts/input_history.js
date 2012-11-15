var InputHistory = function() {
  this.messages = [];
  this.limit = 20; // how many messages we store in history
  this.currentPosition = 0;
}

InputHistory.fn = InputHistory.prototype;

InputHistory.fn.size = function() {
  return this.messages.length;
}

InputHistory.fn.addMessage = function(text) {
  var size = this.messages.push(text);
  if (size>this.limit) {
    this.messages.shift();
    size = this.limit;
  }
  this.currentPosition = size;

  return this.messages;
}

InputHistory.fn.getNext = function() {
  this.currentPosition++;
  
  if (this.currentPosition > this.size()-1) {
    this.currentPosition = 0;
  }

  return this.messages[this.currentPosition];
}

InputHistory.fn.getPrevious = function() {
  this.currentPosition--;

  if (this.currentPosition < 0) {
    this.currentPosition = this.size()-1;
  }
  
  return this.messages[this.currentPosition];
}
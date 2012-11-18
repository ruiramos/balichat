/* Copyright (c) 2012 Twintend (http://twintend.com)
 *
 * Input history. Handles the history of the input text.
 *
 */
var InputHistory = function() {
  var messages = [],
      limit = 20, // how many messages we store in history
      currentPosition = 0;
  
  return {
    size: function() {
      return messages.length;
    },

    addMessage: function(text) {
      var size = messages.push(text);
      if (size>limit) {
        messages.shift();
        size = this.limit;
      }
      currentPosition = size;

      return messages;
    },
  
    /*
     * Returns the next input in the history. You get it with ARROW UP key. So in
     * practice it is the previous one (chronologically speaking).
     *
     */
    getNext: function() {
      currentPosition++;
    
      if (currentPosition > this.size()-1) {
        currentPosition = this.size();
        return '';
      }

      return messages[currentPosition];
    },

    /*
     * Returns the next input in the history. You get it with ARROW DOWN key. So in
     * practice it is the next one (chronologically speaking).
     *
     */
    getPrevious: function() {
      currentPosition--;

      // If we reach the end we should not continue
      if (currentPosition < 0) {
        currentPosition = 0;
      }

      return messages[currentPosition];
    }
  }
}
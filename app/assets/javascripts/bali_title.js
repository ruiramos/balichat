/* Copyright (c) 2012 Twintend (http://twintend.com)
 *
 * Titlebar handler. Sets and changes the window titlebar when needed.
 *
 */
var BaliTitle = (function() {
  var defaultTitle = 'Balichat',
      titleQueue = [defaultTitle],
      titleTimeout = null,
      currentTitle = 0;

  // Public methods
  return {
    update: function() {
      nextTitleIndex = currentTitle % titleQueue.length;
      if (typeof(titleQueue[nextTitleIndex]) === 'string') {
        newTitle = titleQueue[nextTitleIndex];}
      else {
        newTitle = "("+titleQueue[nextTitleIndex].unread+") "+titleQueue[nextTitleIndex].room;
      }
      document.title = newTitle;
      currentTitle++;
    },

    pushMessage: function() {
      if (!BaliUi.isFocused()) {
        var activeMuc = Bali.getActiveMuc();
        var unread = ++activeMuc.unreadMessages;
        var room = activeMuc.roomName;
        var found = false;

        $(titleQueue).each(function(i, el) {
          if (room == el.room) {
            el.unread = unread;
            found = true;
            return;
          }
        });

        if (!found) { 
          titleQueue.push({'room': room, 'unread': unread});
        }

        if (!titleTimeout) {
          titleTimeout = setInterval(function(){ BaliTitle.update() }, 1500);
        }
      }
    },

    clear: function() {
      titleQueue = [defaultTitle];
      clearInterval(titleTimeout);
      titleTimeout = null;
      this.update();
      currentTitle = 0;

      Bali.getActiveMuc().unreadMessages = 0;
    },
  }
})();
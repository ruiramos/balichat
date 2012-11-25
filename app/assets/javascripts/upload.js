$(function() {

  $('.direct-upload').each(function() {

    var form = $(this)

    $(this).fileupload({
      url: form.attr('action'),
      type: 'POST',
      autoUpload: true,
      dataType: 'xml', // This is really important as s3 gives us back the url of the file in a XML document
      
      add: function (event, data) {
        $('.progress').show();
        $.ajax({
          url: "/documents",
          type: 'POST',
          dataType: 'json',
          data: {doc: {filename: data.files[0].name, chatroom: Bali.getActiveMuc().jid}},  // send the file name to the server so it can generate the key param
          async: false,
          success: function(data) {
            // Now that we have our data, we update the form so it contains all
            // the needed data to sign the request
            form.find('input[name=key]').val(data.key)
            form.find('input[name=policy]').val(data.policy)
            form.find('input[name=signature]').val(data.signature)
          }
        })
        data.submit();
      },

      send: function(e, data) {
        $('.progress').fadeIn();
      },

      progress: function(e, data){
        // This is what makes everything really cool, thanks to that callback
        // you can now update the progress bar based on the upload progress
        var percent = Math.round((e.loaded / e.total) * 100)
        $('.bar').css('width', percent + '%')
      },

      fail: function(e, data) {
        console.log('fail')
        console.log(data);
      },

      success: function(data) {
        // Here we get the file url on s3 in an xml doc
        var url = $(data).find('Location').text().replace(/%2F/ig, "/");
        var filename = url.split("/").pop();
        window.Bali.getActiveMuc().sendNotification('notify', 'just uploaded <a href="'+url+'">'+filename+'</a>');

        $('#real_file_url').val(url) // Update the real input in the other form
      },

      done: function (event, data) {
        $('.progress').fadeOut(300, function() {
          $('.bar').css('width', 0)
        })
      }
    })
  })
})

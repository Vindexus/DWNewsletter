console.log('Welcome to Dungeon World Newsletter. Thanks for checking out my console!')
$(document).ready( function () {
    // I only have one form on the page but you can be more specific if need be.
    var $form = $('form');

    $form.submit(function (e) {
      e.preventDefault()
      console.log('submitting')
      register($form)
    })
});

function successMsg (msg) {
  $('#signup-response').attr('class', 'alert alert-success').html(msg)
}

function errorMsg (msg) {
  $('#signup-response').attr('class', 'alert alert-danger').html(msg)
}

function hideMsg (msg) {
  $('#signup-response').attr('class', '').html('')
}

function register($form) {
  if($form.disabled) {
    return
  }

  hideMsg()

  var email = $('input[name=EMAIL]').val()
  if(!email || email.indexOf('@') < 1) {
    errorMsg('Please enter a valid email (and mark XP)')
    return
  }
  
  $form.disabled = true
  $('form .btn').text('Submitting...')
  $.ajax({
      type: $form.attr('method'),
      url: $form.attr('action'),
      data: $form.serialize(),
      cache       : false,
      dataType    : 'json',
      contentType: "application/json; charset=utf-8",
      error       : function(err){
        $('form .btn').text('Subscribe')
        $form.disabled = false
        errorMsg('ERROR: ' + err.toString())
      },
      success     : function(data) {
        $('form .btn').text('Subscribe')
        $form.disabled = false
        if (data.result != "success") {
          
          errorMsg(data.msg)
        } else {
          $('input[name=EMAIL]').val(''
            )
          successMsg('<strong>Subscribed!</strong><br /> Take +1 ongoing to Dungeon World.')
        }
      }
  });
}
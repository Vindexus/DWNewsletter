$(document).ready( function () {
  $( "#entries-exclude, #entries-include" ).sortable({
    connectWith: ".issue-entries-sorting",
    update: function (event, ui) {
      var ids = [];
      $('#entries-include li').each(function (index, el) {
        ids.push($(el).attr('id'))
      })
      $.ajax('/manager/issue/' + $('#issue-id').val() + '/entries', {
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify({
          entryIds: ids
        }),
        success: function (data) {
          $('#issue-html').val(data);
        },
      });
    }
  }).disableSelection();

  $.ajax('/manager/issue/' + $('#issue-id').val() + '/html', {
    type: 'GET',
    success: function (data) {
      $('#issue-html').val(data);
    },
  });
});

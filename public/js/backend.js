$(document).ready( function () {
  $( "#entries-exclude, #entries-include" ).sortable({
    connectWith: ".issue-entries-sorting",
    update: function (event, ui) {
      var ids = [];
      $('#entries-include li').each(function (index, el) {
        ids.push($(el).attr('id'))
      })
      $.ajax('/issues/' + $('#issue-id').val() + '/entries', {
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

  $.ajax('/issues/' + $('#issue-id').val() + '/html', {
    type: 'GET',
    success: function (data) {
      $('#issue-html').val(data);
    },
  });

  $.getJSON('/entries/authors', function (data) {
    console.log('data', data);
    console.log(arguments)
    var authors = data.authors;
    $('select[role=author-suggestion]').each(function (index, el) {
      $(el).html('<option value="-1"></option>' + data.authors.map(function (author) {
        return '<option value="' + index + '">' + author.name + ' - ' + author.url + '</option>';
      }).join("\n"));

      $(el).change(function () {
        var val = $(this).val();
        val = parseInt(val);
        if(!isNaN(val) && val >= 0) {
          var author = authors[val];
          $('input[name=author]').val(author.name);
          $('input[name=authorUrl]').val(author.url);
        }
      })
    });
  })
  
});

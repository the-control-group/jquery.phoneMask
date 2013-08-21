/*!
 * phoneMask jQuery plugin v0.2
 * mike.marcacci@gmail.com
 */

(function ( $ ) {

  $.fn.phoneMask = function(input_sizes) {

    var process_change = function(container, change){

      var input = $('input', container);
      var input_sizes = container.data('input_sizes')
      var selection = {
        start: input.prop('selectionStart'),
        end: input.prop('selectionEnd'),
        direction: input.prop('selectionDirection')
      }

      if(container.data('selection')) {
        selection = container.data('selection');
        container.data('selection', null)
      }

      // strip non-numeric, trim to 10 characters
      input.val(input.val().replace(/[^0-9]/g,'').substr(0,10)); // TODO: support other max lengths
      input.prop('selectionStart', selection.start);
      input.prop('selectionEnd', selection.end);
      input.prop('selectionDirection', selection.direction);

      var val = input.val();

      var digits = input.val().split('');
      $.each(digits,function(i,digit){
        digits[i] = '<span class="digit">'+digit+'</span>';
      })

      // insert selection and assign digits to inputs
      var start = 0;
      var contents = [];
      var selected_input = 0;

      $.each(input_sizes, function(i, size){
        if(selection.start == selection.end) {
          // single caret

          // is the selection in this input section?
          if((selection.start >= start && selection.start < start + size) || (selection.start >= start && i == input_sizes.length - 1)) {

            selected_input = i; // highlight this input

            var arr = [];
            arr = arr.concat(digits.slice(start, selection.start))
            arr = arr.concat(['<span class="caret"></span>']);
            arr = arr.concat(digits.slice(selection.start, start + size))

            // add array to contents
            contents.push(arr);
          } else {
            contents.push(digits.slice(start, start + size));
          }
        } else {
          // selection range

          if(selection.start > start + size || selection.end < start) {
            // if none selected in this section
            contents.push(digits.slice(start, start + size));
          } else {
            var arr = [];
            if(selection.start > start) arr = arr.concat(digits.slice(start, selection.start));

            // wrap digits in span.selected
            $.each(digits.slice((start > selection.start) ? start : selection.start, (start + size < selection.end) ? start + size : selection.end), function(i, digit){
              arr.push($("<div></div>").append($(digit).addClass('selected')).html());
            })
            
            if(selection.end < start + size) arr = arr.concat(digits.slice(selection.end, start + size));

            // add array to contents
            contents.push(arr);
          }

        }

        // increase the start size
        start = start + size;

      })



      $('.input .text', container).each(function(i){
        if(typeof contents[i].join == "function") $(this).html(contents[i].join(''));
      })

      $('.text', container).each(function(){
        $(this).html($(this).html().replace('|', '<span class="selection"></span>'))
      })

      $('div > span.input', container).removeClass('focus'); // infocus all sections
      if(selection.start == selection.end) $('div > span.input', container).eq(selected_input).addClass('focus') // focus on correct section
    }

    var process_select = function(container) {
      var selection = window.getSelection();

      if(selection.type == 'Range' && selection.baseNode && selection.focusNode && $(container).has(selection.baseNode) && $(container).has(selection.focusNode) && $(selection.baseNode).parent().hasClass('digit')) {
        // selection range

        var start = $('.digit', container).index($(selection.baseNode).parent()) + selection.baseOffset;


        var end;
        if($(selection.focusNode).parent().hasClass('digit')){
          end = $('.digit', container).index($(selection.focusNode).parent()) + selection.focusOffset;
        } else {
          var selection_length = selection.toString().replace(/[^0-9]/g,'').length;

          var focusIndex = container.find('div > span').index($(selection.focusNode).closest('div > span', container));
          var baseIndex = container.find('div > span').index($(selection.baseNode).closest('div > span', container));

          if(focusIndex > baseIndex) {
            end = start + selection_length;
          } else {
            end = start - selection_length;
          }
        }

        $(container).data('selection', {
          'start': (start > end) ? end : start,
          'end': (start > end) ? start : end,
          'direction': (start > end) ? 'backward' : 'forward'
        })

      } else if(selection.type == 'Caret') {
        // single caret

        if(selection.focusNode && $(container).has(selection.baseNode) && $(selection.focusNode).parent().hasClass('digit')) {

          var caret = $('.digit', container).index($(selection.focusNode).parent()) + selection.focusOffset; // put the caret *after* the clicked node

          $(container).data('selection', {
            'start': caret,
            'end': caret,
            'direction': 'none'
          })
        }

      } else {
        $(container).data('selection', {
          'start': $('input', container).val().length,
          'end': $('input', container).val().length,
          'direction': 'none'
        })
      }

      $('input', container).focus();

    }

    return this.each(function(){
      var container = $(this);

      // set config
      container.data('input_sizes', $.extend([
        3, //area
        3, //exchange
        4  //suffix
      ], input_sizes));

      // init
      container.addClass('phoneMask');
      process_change(container);

      container.on('mousedown', function(e){
        $('.selected', container).removeClass('selected');
      }).on('mouseup', function(e){
        process_select(container);
      })

      $('input', container).on('focus', function(e){
        // $(this).prop('selectionStart', $(this).val().length).prop('selectionEnd', $(this).val().length)
        container.addClass('focus');
        process_change(container);

      }).on('blur', function(e){

        container.removeClass('focus');
        $('div > span', container).removeClass('focus');
        $('.caret', container).remove();

      }).on('keyup', function(e){
        process_change(container);

      }).on('input propertychange', function(e){
        process_change(container);
      })

      $('input', container).blur();

    });
  };

}( jQuery ));
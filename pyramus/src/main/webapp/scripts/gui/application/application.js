(function() {

  var applicationSections = $('.form-section');

  $(document).ready(function() {
    
    $.fn.serializeObject = function() {
      var o = {};
      var a = this.serializeArray();
      $.each(a, function() {
        if (o[this.name] !== undefined) {
          if (!o[this.name].push) {
            o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
        }
        else {
          o[this.name] = this.value || '';
        }
      });
      return o;
    };
    
    // Attachments uploader
    
    $('#field-attachments').on('change', function() {
      var filesSize = 0;
      var files = $(this)[0].files;
      $('#field-attachments-files').find('.application-file').each(function() {
        var hash = $(this).find('input[name="field-attachments-file"]').val();
        filesSize += parseInt($(this).find('input[name="field-attachments-file-' + hash + '-size"]').val());
      });
      for (var i = 0; i < files.length; i++) {
       filesSize += files[i].size;
      }
      if (filesSize > 10485760) {
        $('.notification-queue').notificationQueue('notification', 'error', 'Liitteiden suurin sallittu yhteiskoko on 10 MB');
        return;
      }
      for (var i = 0; i < files.length; i++) {
        uploadAttachment(files[i]);
      }
      $(this).val('');
    });
    
    // Dynamic data
    
    $('select[data-source]').each(function() {
      var field = this;
      $.ajax({
        url: $(field).attr('data-source'),
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function(result) {
          for (var i = 0; i < result.length; i++) {
            var option = $('<option>').attr('value', result[i].value).text(result[i].text);
            $(field).append(option);
            if ($(field).val() == '' && $(field).attr('data-preselect') && result[i].text == $(field).attr('data-preselect')) {
              $(option).prop('selected', true);
            }
          }
        }
      });
    });
    
    // Section checks
    
    $('#field-line').on('change', function() {
      var line = $(this).val();
      var option =  $(this).find('option:selected');
      var hasAttachmentSupport = $(option).attr('data-attachment-support') == 'true';
      $('.section-attachments').attr('data-skip', !hasAttachmentSupport);
      $('.section-internetix-school').attr('data-skip', option.val() != 'aineopiskelu');
      // section toggle for existing applications
      var existingApplication = $('#field-application-id').attr('data-preload');
      if (existingApplication) {
        $('.section-attachments').toggle(hasAttachmentSupport);
        $('.section-internetix-school').toggle(line == 'aineopiskelu');
      }
      // age check when line changes 
      $('#field-birthday').trigger('change');
      // semi-required ssn postfix
      if (line == 'mk') {
        $('label[for="field-ssn-end"]').removeClass('required');
      }
      else {
        $('label[for="field-ssn-end"]').addClass('required');
      }
      // update page count
      updateProgress();
    });
    $('#field-birthday').on('change', function() {
      var birthday = $(this).val();
      if (birthday) {
        var years = moment().diff(moment(birthday, "D.M.YYYY"), 'years');
        var line = $('select[name="field-line"]').val();
        var hasUnderageSupport = $('#field-line option:selected').attr('data-underage-support') == 'true';
        $('.section-underage').attr('data-skip', !hasUnderageSupport || years >= 18);
      }
      else {
        $('.section-underage').attr('data-skip', 'true');
      }
      var existingApplication = $('#field-application-id').attr('data-preload');
      if (existingApplication) {
        $('.section-underage').toggle($('.section-underage').attr('data-skip') != 'true');
      }
      updateProgress();
    });
    
    // Custom validators
    
    Parsley.addValidator('birthdayFormat', {
      requirementType: 'string',
      validateString: function(value) {
        return value && moment(value, 'D.M.YYYY').isValid() && value.lastIndexOf('.') == value.length - 5;
      },
      messages: {
        fi: 'Päivämäärän muoto on virheellinen'
      }
    });

    Parsley.addValidator('ssnEndFormat', {
      requirementType: 'string',
      validateString: function(value) {
        return isValidSsnEnd(value, $('#field-line').val() == 'mk');
      },
      messages: {
        fi: 'Henkilötunnuksen loppuosan muoto on virheellinen'
      }
    });
    
    Parsley.addValidator('requiredIfShown', {
      requirementType: 'string',
      validateString: function(value, requirement, event) {
        var element = event.element;
        if ($(element).is(':visible')) { 
          if (!value || value.trim().length == 0) {
            return false;
          }
        }
        return true;
      },
      validateMultiple: function(value, requirement, event) {
        var element = event.element;
        if ($(element).is(':visible')) { 
          if (value.length == 0) {
            return false;
          }
        }
        return true;
      },
      messages: {
        fi: 'Tämä kenttä on pakollinen'
      }
    });
    
    // Allow other sex with valid ssn postfix
    
    $('#field-ssn-end').on('change', function() {
      var valid = isValidSsnEnd($(this).val(), false);
      var otherOption = $('#field-sex option[value="muu"]');
      if (valid && otherOption.length == 0) {
        $('#field-sex').append($('<option>').attr('value', 'muu').text('Muu'));
      }
      else {
        $(otherOption).remove();
        if ($('#field-sex').val() == 'muu') {
          $('#field-sex').val('');
        }
      }
    });
    
    // Dependencies
    
    $('[data-dependencies]').change(function() {
      var name = $(this).attr('name');
      var value = $(this).is(':visible') ? $(this).is(':checkbox') ? $(this).is(':checked') ? $(this).val() : '' : $(this).val() : '';
      $('.field-container[data-dependent-field="' + name + '"]').each(function() {
        var show = false;
        var values = $(this).attr('data-dependent-values').split(',');
        for (var i = 0; i < values.length; i++) {
          show = values[i] == value;
          if (show) {
            break;
          }
        }
        $(this).toggle(show);
        $(this).find('[data-dependencies]').trigger('change');
      });
      if ($(this).hasClass('parsley-success') || $(this).hasClass('parsley-error')) {
        $('.application-form').parsley().validate({group: 'block-' + currentIndex()});
      } 
    });
    
    // Privacy policy
    
    $('.summary-privacy-link').on('click', function() {
      $('.privacy-policy-overlay').toggle();
      $('.privacy-policy-container').toggle();
    });
    
    $('.privacy-policy-close').on('click', function() {
      $('.privacy-policy-overlay').toggle();
      $('.privacy-policy-container').toggle();
    });
    
    // Form navigation

    $('.button-previous-section').click(function() {
      var newIndex = currentIndex() - 1;
      while ($(applicationSections[newIndex]).attr('data-skip') == 'true') {
        newIndex--;
      }
      navigateTo($(applicationSections[newIndex]));
    });
    
    $('.button-next-section').click(function() {
      if ($('.application-form').parsley().validate({group: 'block-' + currentIndex()})) {
        var newIndex = currentIndex() + 1;  
        while ($(applicationSections[newIndex]).attr('data-skip') == 'true') {
          newIndex++;
        }
        navigateTo($(applicationSections[newIndex]));
      }
    });

    $('.button-save-application').click(function() {
      // TODO Disable UI, show saving message 
      var valid = false;
      var existingApplication = $('#field-application-id').attr('data-preload');
      if (existingApplication) {
        valid = $('.application-form').parsley().validate();
      }
      else {
        valid = $('.application-form').parsley().validate({group: 'block-' + currentIndex()});
      }
      if (valid) {
        var data = JSON.stringify($('.application-form').serializeObject());
        $.ajax({
          url: "/1/application/saveapplication",
          type: "POST",
          data: data, 
          dataType: "json",
          contentType: "application/json; charset=utf-8",
          success: function(response) {
            $('#edit-info-last-name').text($('#field-last-name').val());
            $('#edit-info-reference-code').text(response.referenceCode);
            $('#edit-info-email').text($('#field-email').val());
            navigateTo('.section-done');
          },
          error: function() {
            $('.notification-queue').notificationQueue('notification', 'error', 'Virhe tallennettaessa hakemusta: ' + err.statusText);
          }
        });
      }
    });
    
    $('.button-edit-application').click(function() {
      if ($('.application-form').parsley().validate()) {
        var data = JSON.stringify($('.application-form').serializeObject());
        $.ajax({
          url: "/1/application/getapplicationid",
          type: "POST",
          data: data, 
          dataType: "json",
          contentType: "application/json; charset=utf-8",
          success: function(response) {
            window.location.replace(window.location.href + '?applicationId=' + response.applicationId);
          },
          error: function() {
            $('.notification-queue').notificationQueue('notification', 'error', 'Virhe hakemusta ladattaessa: ' + err.statusText);
          }
        });
      }
    });

    $(applicationSections).each(function(index, section) {
      $(section).find(':input').attr('data-parsley-group', 'block-' + index);
    });
    navigateTo($(applicationSections).get(0));

    // Previously stored data
    
    var existingApplication = $('#field-application-id').attr('data-preload');
    if (existingApplication) {
      $('#application-page-indicator').hide();
      $('#button-previous-section').hide();
      $('#button-next-section').hide();
      $('#button-save-application').show();
      $('.form-navigation').show();
      preloadApplication($('#field-application-id').val());
    }
  });

  function navigateTo(section) {
    $('.form-section.current').removeClass('current');
    $('.form-section').hide();
    $(section).addClass('current').show();
    $('.form-navigation').toggle(!$(section).hasClass('section-done'));
    $('.button-previous-section').toggle(!$(section).hasClass('section-line'));
    $('.button-next-section').toggle(!$(section).hasClass('section-summary'));
    $('.button-save-application').toggle($(section).hasClass('section-summary'));
    if ($(section).hasClass('section-summary')) {
      $('#summary-name').text($('#field-first-names').val() + ' ' + $('#field-last-name').val());
      $('#summary-phone').text($('#field-phone').val());
      $('#summary-email').text($('#field-email').val());
    }
    updateProgress();
  }
  
  function isValidSsnEnd(value, allowEmpty) {
    if (value == '') {
      return allowEmpty;
    }
    return value != '' && value.length == 4 && /^[0-9]{3}[a-zA-Z0-9]{1}/.test(value);
  }
  
  function updateProgress() {
    $('.application-page-indicator').text(currentPage() + ' / ' + totalPages());    
  }
  
  function currentPage() {
    var page = 0;
    for (var i = 0; i < $(applicationSections).size(); i++) {
      var section = $(applicationSections).get(i);
      if ($(section).attr('data-skip') == 'true') {
        continue;
      }
      page++;
      if ($(section).hasClass('current')) {
        break;
      }
    }
    return page;
  }
  
  function totalPages() {
    var pages = 0;
    for (var i = 0; i < $(applicationSections).size(); i++) {
      var section = $(applicationSections).get(i);
      if ($(section).attr('data-skip') == 'true') {
        continue;
      }
      pages++;
    }
    return pages;
  }

  function currentIndex() {
    return $(applicationSections).index($(applicationSections).filter('.current')); 
  }

  function preloadApplication() {
    var applicationId = $('#field-application-id').val();
    $.ajax({
      url: "/1/application/getapplicationdata/" + applicationId,
      type: "GET",
      contentType: "application/json; charset=utf-8",
      success: function(result) {
        for (var key in result) {
          if (key.startsWith('field-attachments-')) {
            continue;
          }
          var formElement = $('[name="' + key + '"]');
          if (formElement.length) {
            if ($(formElement).is('select')) {
              $(formElement).val(result[key]);
              $('option', $(formElement)).each(function() {
                if (this.value == result[key]) {
                  $(this).prop('selected', true);
                }
              });
            }
            else if ($(formElement).is('textarea')) {
              $(formElement).val(result[key]);
            }
            else {
              switch ($(formElement).attr("type")) {
              case 'text':
              case 'email':
              case 'hidden':
                $(formElement).val(result[key]);
                break;
              case 'radio':
              case 'checkbox':
                var values = Array.isArray(result[key]) ? result[key] : [result[key]];
                $(formElement).each(function() {
                  for (var i = 0; i < values.length; i++) {
                    if ($(this).attr('value') == values[i]) {
                      $(this).prop('checked', true);
                    }
                  }
                });
                break;
              }
            }
            $(formElement).trigger('change');
          }
        }
        preloadApplicationAttachments(result);
        $('.form-section').each(function() {
          $(this).toggle($(this).attr('data-skip') != 'true' && !$(this).hasClass('section-summary'));
        });
      }
    });
  }
  
  function preloadApplicationAttachments(result) {
    var applicationId = $('#field-application-id').val();
    var fileContainer = $('#field-attachments-files');
    var files = result['field-attachments-file'];
    if (files) {
      if (!$.isArray(files)) {
        files = JSON.parse('[' + files + ']');
      }
      for (var i = 0; i < files.length; i++) {
        var name = result['field-attachments-file-' + files[i] + '-name'];
        var size = result['field-attachments-file-' + files[i] + '-size'];
        createAttachmentFormElement(files[i], name, size);
      }
    }
  }
  
  function createAttachmentFormElement(hash, name, size) {
    var applicationId = $('#field-application-id').val();
    var fileContainer = $('#field-attachments-files');
    var fileElement = $('.application-file.template').clone();
    fileElement.removeClass('template');
    fileContainer.append(fileElement);
    fileElement.find('.application-file-link').attr('href', '/1/application/getattachment/' + applicationId + '?attachment=' + name);
    fileElement.find('.application-file-size').text((size / 1024 + 1).toFixed(0) + ' KB');
    fileElement.find('.application-file-link').text(name);
    fileElement.find('.application-file-delete').on('click', function() {
      $.ajax({
        url: '/1/application/removeattachment/' + applicationId + '?attachment=' + name,
        type: 'DELETE',
        success: function(data) {
          fileElement.remove();
        },
        error: function(err) {
          fileElement.remove();
        }
      });
    });
    fileElement.append($('<input>').attr({type: 'hidden', name: 'field-attachments-file', 'value': hash}));
    fileElement.append($('<input>').attr({type: 'hidden', name: 'field-attachments-file-' + hash + '-name', 'value': name}));
    fileElement.append($('<input>').attr({type: 'hidden', name: 'field-attachments-file-' + hash + '-size', 'value': size}));
    fileElement.show();
  }
  
  function uploadAttachment(file) {
    var hash = 0, i, chr;
    if (file.name.length > 0) {
      for (i = 0; i < file.name.length; i++) {
        chr = file.name.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      hash = Math.abs(hash);
    }
    var applicationId = $('#field-application-id').val();
    var fileContainer = $('.field-attachments-files'); 
    var fileName = decodeURIComponent(file.name);
    var formData = new FormData();
    formData.append('file', file);
    formData.append('name', fileName);
    formData.append('applicationId', applicationId);
    
    var progressElement = $('.application-file-upload-progress.template').clone();
    progressElement.removeClass('template');
    progressElement.find('.application-file-upload-progress-text').text('Lähetetään tiedostoa ' + fileName);
    var progressBarElement = progressElement.find('.application-file-upload-progress-bar');
    progressBarElement.progressbar({
      value: 0
    });
    $('#field-attachments-files').append(progressElement);
    progressElement.show();

    $.ajax({
      url: '/1/application/createattachment',
      type: 'POST',
      processData: false,
      contentType: false,
      data: formData,
      xhr: function() {
        myXhr = $.ajaxSettings.xhr();
        if (myXhr.upload) {
          myXhr.upload.addEventListener('progress', function(evt) {
            if (evt.lengthComputable) {
              var percentComplete = (evt.loaded / evt.total) * 100;
              progressBarElement.progressbar('value', percentComplete);
            }
          }, false);
        }
        return myXhr;
      },
      success: function(data) {
        progressElement.remove();
        createAttachmentFormElement(hash, fileName, file.size);
      },
      error: function(err) {
        if (err.status == 409) {
          $('.notification-queue').notificationQueue('notification', 'warn', 'Hakemuksessa on jo samanniminen liite');
        }
        else {
          $('.notification-queue').notificationQueue('notification', 'error', 'Virhe tallennettaessa liitettä: ' + err.statusText);
        }
        progressElement.remove();
      }
    });
  }
  
}).call(this);
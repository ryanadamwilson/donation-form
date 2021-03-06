(function($) {
    // define API init
    luminateExtend({
        apiKey: '72737007',
        path: {
            nonsecure: 'http://mskcc.convio.net/site/',
            secure: 'https://secure2.convio.net/mskcc/site/'
        }
    });

    $(function() {
        //Adding a custom function for improved select dropdown validation
        $.validator.addMethod("selectValid", function(value, element, arg){
          return arg != value;
        }, "Value must not equal arg.");
        //Add custom rules to validate
        $('.donation-form').validate({
            rules: {
                level_id: {
                    required: true
                },
                other_amount: {
                    number: true,
                    required: '#level-other:checked'
                },
                card_number: {
                    required: '#pymt_type_cc:checked'
                },
                card_cvv: {
                    required: '#pymt_type_cc:checked'
                },
                card_exp_date_month: {
                    required: '#pymt_type_cc:checked'
                },
                card_exp_date_year: {
                    required: '#pymt_type_cc:checked'
                },
                tribute_type: {
                    required: true
                },
                donor_email: {
                    email: true,
                    required: true
                },
                billing_address_state: {
                    selectValid: ""  //leave as a blank quotation
                },
                billing_address_zip: {
                    minlength: function(element) {
                        if($('#billing_address_country option:selected').val() == 'United States') {
                            return 5;
                        }
                    }
                },
                designated_write_in: {
                    required: '#des-other:checked'
                },
                designated_id: {
                    required: '.designate:checked'
                }
            },
            messages: {
                level_id: "Please select a donation level.",
                other_amount: {
                    required: "Please enter the 'Other' amount.",
                    number: "The 'Other' input has invalid characters. You may only use numbers in this field. A decimal is also allowed."
                },
                tribute_type: "Please select a tribute type.",
                donor_email: "Please enter a valid email.",
                billing_address_state: "This field is required.",
                billing_address_zip: {
                    minlength: "Please enter a valid US zip code."
                },
                designated_id: "Please select a program to support.",
                designated_write_in: "Please identify the 'Other' program you wish to support with your donation."
            },
            errorPlacement: function(error, element) {
                //Injecting some of the errors to the top of the form
                //Most errors are injected right after the offending input
                if ( element.is(":radio") || element.hasClass('other-input')) {
                    if($('#donation-errors').length <= 0) {
                        $('.donation-form').before('<div id="donation-errors"></div>');
                    }
                    if($('#level_id-error, #tribute_type-error, #other-amount-error, #designated_id-error, #other-des-input-error').length <= 0) {
                        error.prependTo('#donation-errors');
                        $('#level_id-error, #tribute_type-error, #other-amount-error, #designated_id-error, #other-des-input-error').addClass('alert alert-danger col-xs-12');
                    }
                } else { // This is the default behavior
                    error.insertAfter( element );
                }
            },
            invalidHandler: function(form, validator) {
                // Remove old alerts, if any
                $('.alert').remove();
                return false;
            },
            submitHandler: function(form) {
                //Spam prevention
                if ($('#catch').val() == false) {
                    //Hide form and display loading div while pinging API
                    $('.donation-form').hide();
                    $('.donation-copy, .readmore-js-toggle').hide();
                    $('.donation-copy').before('<div class="well donation-loading">' +
                                     'Processing ...' +
                                   '</div>');

                    // Remove old alerts, if any
                    $('.alert').remove();

                    //Vars used by API call, we use this function to build our data
                    var donationData = buildAPIMethodString();

                    //Callback returns response on success/failure of request
                    var donateCallback = function(data) {
                        showResponse(data);
                    };
                    var startDonationCallback = function(data) {
                        showResponse(data);
                    };

                    if($('input#pymt_type_pp').is(':checked')) {
                        //Call startDonation API
                        luminateExtend.api({
                            api: 'CRDonationAPI',
                            data:   donationData,
                            requestType: 'POST',
                            requiresAuth: false,
                            callback: startDonationCallback
                        });
                    } else {
                        //Call Donate API
                        luminateExtend.api({
                            api: 'CRDonationAPI',
                            data:   donationData,
                            requestType: 'POST',
                            requiresAuth: false,
                            callback: donateCallback
                        });
                    }
                    return false; //block default submit action for from
                } else {
                    //Redirect spammers to general donation error page
                    window.location.replace('https://giving.mskcc.org/general-donation-error');
                }
            }
        });

        function buildAPIMethodString() {

            var userData = {};

            //Assigning form and level IDs as key/value pairs
            userData['form_id'] = $('input[name="form_id"]').val();
            userData['level_id'] = $('.radio label.checked input[type="radio"]').val();

            //collect the general user enetered data and assign them as key/value pairs
            $('input.required, select.required, input.optional, select.optional, input.form-control-check').each(function() {
                var el = $(this);
                var name = el.data('convio');
                if (el.is('input')) {
                    var userEntered = el.val();
                } else {
                    var userEntered = el.children('option:selected').val();
                }
                //Exclude non-required blank user input, like Street Address 2
                if (userEntered !== '') {
                    userData[name] = userEntered;
                }
            });

            //if recurring monthly gift
            if ($('.sustaining').val() == 'true') {
                userData['sustaining.duration'] = 0;
                userData['sustaining.frequency'] = 'monthly';
            }

            //if donation is a tribute, gather tribute information
            if ($('.tribute-check').val() == 'true') {
                userData['tribute.type'] = $('input[name="tribute_type"]:checked').val();

                $('input.tribute, select.tribute').each(function() {
                    var el = $(this);
                    var name = el.data('convio');
                    if (el.is('input')) {
                        var userEntered = el.val();
                    } else {
                        var userEntered = el.children('option:selected').val();
                    }
                    //Exclude blank inputs
                    if (userEntered !== '') {
                        userData[name] = userEntered;
                    }
                });
            }

            //if donation is a designation, assign designee values
            if ($('.designate').val() == 'true') {
                var designee = $('input[name="designated_id"]:checked').val();
                userData['designated.' + designee + '.id'] = designee;
                //if user enetered designation
                if ($('.other-des label').hasClass('checked')) {
                    userData['designated_write_in.' + $('#other-des-input').val() + '.name'] = $('#other-des-input').val();
                }
            }

            //Use key/value pairs to build API string
            var buildData = '';
            $.each(userData, function(key, value) {
                buildData += '&' + key + '=' + value;
            });
            // create final API string with all required information/user entered data.
            // We'll pass this into the API call
            if($('input#pymt_type_pp').is(':checked')) {
                var donationData = 'method=startDonation' + '&extproc=paypal' + '&finish_error_redirect=' + $('input[name="finish_error_redirect"]').val() + '&finish_success_redirect=' + $('input[name="finish_success_redirect"]').val() + buildData;
            } else {
                var donationData = 'method=donate' + buildData;
            }
            return donationData;
        }

        function showResponse(data) {
            //If something went wrong, display error to user
            if(data.donationResponse.errors) {
                $('input[name="card_cvv"]').val('');
                if($('#donation-errors').length <= 0) {
                    $('.donation-form').before('<div id="donation-errors"></div>');
                }
                if(data.donationResponse.errors.fieldError) {
                    var fieldErrors = luminateExtend.utils.ensureArray(data.donationResponse.errors.fieldError);
                    $.each(fieldErrors, function() {
                            $('#donation-errors').append('<div class="alert alert-danger">' + this + '</div>');
                    });
                }
                if(data.donationResponse.errors.pageError) {
                    $('#donation-errors').append('<div class="alert alert-danger">' + data.donationResponse.errors.pageError + '</div>');
                }
                $('.donation-loading').remove();
                $('.readmore-js-toggle').removeAttr('style');
                $('.donation-copy, .donation-form, #validation-errors:first-of-type .alert').show();
            } else if(data.donationResponse.redirect) {
                window.location.replace(data.donationResponse.redirect.url);
            } else {
                //Otherwise, show success message
                //Pull in GTM tracking information for analytics
                $.ajax({
                    url: "https://secure2.convio.net/mskcc/site/SPageServer?pagename=giv_lunametrics_api&pgwrap=n",
                    success: function(result){
                        $('head').append(result);
                    }
                });
                $.ajax({
                    url: "https://secure2.convio.net/mskcc/site/SPageServer?pagename=google_conversion_async&pgwrap=n",
                    success: function(result){
                        $('head').append(result);
                    }
                });
                //Show correct message for one time donation or monthly
                if ($('.sustaining').val() == 'true') {
                    $('.monthly-don').removeClass('hidden');
                } else {
                    $('.one-time').removeClass('hidden');
                }
                //Inject transaction information into thank you page
                $('.don-amount').text('$' + data.donationResponse.donation.amount.decimal);
                $('#confirmation_code').text(data.donationResponse.donation.confirmation_code);
                $('#trans-id').text(data.donationResponse.donation.transaction_id);
                $('#tax-id').text(data.donationResponse.donation.org_tax_id);
                setToday();
                $('.donation-loading, .donation-copy, .donation-form, .readmore-js-toggle').remove();
                $('.thank-you').addClass('active');
                $('.thank-you').show();
            }
        }

    });
})(jQuery);

function showCVVMsg(){
    var msgHeight = $('#msg-pop-up').height();
    var msgWidth = $('#msg-pop-up').width();
    var anchorOffset = $('#cvv_button').offset();
    var bodyWidth = $('body').width();

    var top_position = anchorOffset.top  - (msgHeight + 5);
    var left_position = anchorOffset.left - 205;

    if(bodyWidth < 481 && bodyWidth > 350 ){
        left_position = 25;
        $('.arrow-down').css('margin-left', anchorOffset.left + 20 );
    } else if(bodyWidth <= 350) {
        left_position = 25;
        $('.arrow-down').css('margin-left', anchorOffset.left + 20);
    }

    $('#msg-pop-up').css( {
        top: top_position,
        left: left_position
    });

    $('#msg-pop-up').fadeIn(400);

    return false;
};
function setToday() {
    var d = new Date().getDate();
    var m = new Date().getMonth() + 1;
    var y = new Date().getFullYear();
    var today = m + '/' + d + '/' + y;
    $('#date').text(today);
}
//If Other level is prechecked, focus on input
//Also insert amount if necessary
function checkedLevelFocus() {
    var amount = $('#other-amount').val();
    $('#other-amount').focus();
    $('#other-amount').val(amount);
}
//Any UI handling for Angular manipulated elements needs to be stored in this function
function UIHandlers() {

    //Add class for CSS purposes
    $('.radio label').on('click', function() {
        $(this).closest('.form-group').find('.radio label').removeClass('checked');
        $(this).addClass('checked');
        if($(this).is('.other')) {
            $(this).find('input[type="radio"]').prop('checked', true);
        } else {
            $(this).closest('.form-group').find('.other input[type="radio"]').prop('checked', false);
            $(this).closest('.form-group').find('.other-input').val('');
        }
    });

    //Add $ to Other text box and prevent it from being deleted
    $('#other-amount').on('focus', function() {
        if(!$(this).parent().hasClass('checked')) {
            $(this).prop('placeholder', '');
        }
    });

    //Prevent more than two numbers after decimal
    $('#other-amount').keypress(function (e) {
        var character = String.fromCharCode(e.keyCode)
        var newValue = this.value + character;
        if (hasDecimalPlace(newValue, 3)) {
            e.preventDefault();
            return false;
        }
    });

    function hasDecimalPlace(value, x) {
        var pointIndex = value.indexOf('.');
        return  pointIndex >= 0 && pointIndex < value.length - x;
    }

    //Checkbox functionality
    $('input[type="checkbox"]').click(function() {
        var val = $(this).val();
        (val == 'true' ? val = false : val = true);
        $(this).val(val);
    });

    //Display hidden sections
    $('input.designate, input.tribute-check').on('change', function() {
        $(this).closest('.row').next('div').slideToggle();
    });

    $('.close-button').click(function() {
        $('#msg-pop-up').fadeOut(400);
    });

    //Select payment type
    $('.pymt-type').click(function() {
        var self = $(this);
        if(!self.hasClass('active')) {
            $('.pymt-type').toggleClass('active');
            $('.pymt-info-cc').slideToggle();
            if(self.hasClass('pp')){
                $('#donate-submit').text('Continue with PayPal');
            } else {
                $('#donate-submit').text('Submit Donation');
            }
        }
    });

    //Read more function
    $('.readmore-js-toggle').click(function() {
        if($(this).hasClass('active')) {
            $('.readmore-js-toggle').removeAttr('style');
            $('.donation-copy').animate({ 'height': 200}, 500);
            $('.readmore-js-toggle i').removeClass('icon-chevron-up');
            $('.readmore-js-toggle i').addClass('icon-chevron-down');
        } else {
            var el = $('.donation-copy'),
                curHeight = el.height(),
                autoHeight = el.css('height', 'auto').height() + 20;
            el.height(curHeight).animate({height: autoHeight}, 500, function() {
                $('.readmore-js-toggle').css('background', 'transparent');
            });
            $('.readmore-js-toggle i').removeClass('icon-chevron-down');
            $('.readmore-js-toggle i').addClass('icon-chevron-up');
        }
        $(this).toggleClass('active');
    });

    $('a.readmorebtn').click(function () {
        $('.readmorebtn, .ellip').hide();
        $('.belowFold').show();
    });

    var w = 0;
    $(window).load( function(){
        w = $( window ).width();
    });
    $(window).resize(function() {
        if( w != $(window).width() ){
            if(!$('.thank-you').hasClass('active')) {
                //For some reason this function is adding 16px on to the window width
                //so I set it to 752 instead of 768. But this is triggered at 768px
                if($(window).width() > 752){
                   $('.donation-copy').css('height', 'auto');
                   $('.readmore-js-toggle').removeClass('active');
                   $('.desc-open').removeClass('icon-chevron-up');
                   $('.desc-open').addClass('icon-chevron-down');
               } else {
                   if(!$('.readmore-js-toggle').hasClass('active')) {
                       $('.donation-copy').css('height', '200');
                   }
               }
            }
            w = $( window ).width();
            delete w;
        }
    });
    //Temp fix for making tribute section required
    $('.tribute-check').on('change', function() {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $('.tribute').prop('required', false);
        } else {
            $(this).addClass('active');
            $('.tribute').prop('required', true);
        }
    });

    //Leave at the end of function
    if ($('label.other').hasClass('checked')) {
        checkedLevelFocus();
    }
}

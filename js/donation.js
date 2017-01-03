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
                    required: '#level-other:checked',
                    min: function() {
                        //convert string to integer
                        var other = parseInt($('#other-amount').data('minimum'));
                        return other;
                    }
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
                shipping_address_state: {
                    selectValid: ""  //leave as a blank quotation
                },
                tribute_notify_address_zip: {
                    required: function(element) {
                        if($('#tribute_notify_address_country option:selected').val() == 'United States') {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    minlength: function(element) {
                        if($('#tribute_notify_address_country option:selected').val() == 'United States') {
                            return 5;
                        }
                    }
                },
                billing_address_zip: {
                    required: function(element) {
                        if($('#billing_address_country option:selected').val() == 'United States') {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    minlength: function(element) {
                        if($('#billing_address_country option:selected').val() == 'United States') {
                            return 5;
                        }
                    }
                },
                shipping_address_zip: {
                    required: function(element) {
                        if($('#shipping_address_country option:selected').val() == 'United States') {
                            return true;
                        }
                    },
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
                },
                ecard_id: {
                    required: '.ecard-check:checked'
                }
            },
            messages: {
                level_id: "Please select a donation level.",
                other_amount: {
                    required: "Please enter the 'Other' amount.",
                    number: "The 'Other' input has invalid characters. You may only use numbers in this field. A decimal is also allowed.",
                    min: "The minimum amount for the 'Other' input on this donation form is &#36;{0}. Please enter an amount equal to or greater than &#36;{0}."
                },
                tribute_type: "Please select a tribute type.",
                donor_email: "Please enter a valid email.",
                billing_address_state: "This field is required.",
                shipping_address_state: "This field is required.",
                tribute_notify_address_country: {
                    minlength: "Please enter a valid US zip code."
                },
                billing_address_zip: {
                    minlength: "Please enter a valid US zip code."
                },
                shipping_address_zip: {
                    minlength: "Please enter a valid US zip code."
                },
                ecard_id: "Please select a stationery for your eCard.",
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
                    if($('#level_id-error, #tribute_type-error, #other-amount-error, #designated_id-error, #other-des-input-error, #ecard_id-error').length <= 0) {
                        error.prependTo('#donation-errors');
                        $('#level_id-error, #tribute_type-error, #other-amount-error, #designated_id-error, #other-des-input-error, #ecard_id-error').addClass('alert alert-danger col-xs-12');
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
                        console.log(data);
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
            $('input.info, select.info, input.info.form-control-check').each(function() {
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
                userData['sustaining.frequency'] = $('.sustaining').data('convio');
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

            //if an ecard is requested
            if ($('.ecard-check').val() == 'true') {
                userData['ecard.send'] = true;
                userData['ecard.id'] = $('input[name="ecard_id"]:checked').val();

                $('.ecard').each(function() {
                    var el = $(this);
                    var name = el.data('convio');
                    var userEntered = el.val();
                    //Exclude blank inputs
                    if (userEntered !== '') {
                        userData[name] = userEntered;
                    }
                });
            }

            //if shipping information is requested
            if ($('#shipping').length) {
                if ($('.ship-check').val() == 'true') {
                    $('input.billing, select.billing').each(function() {
                        var el = $(this);
                        var name = el.data('convio');
                        name = name.replace('billing', 'shipping');
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
                } else {
                    $('input.shipping, select.shipping').each(function() {
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
            }
            //Use key/value pairs to build API string
            var buildData = '';
            $.each(userData, function(key, value) {
                buildData += '&' + key + '=' + value;
            });
            console.log(buildData);
            // create final API string with all required information/user entered data.
            // We'll pass this into the API call
            if($('input#pymt_type_pp').is(':checked')) {
                var donationData = 'method=startDonation' + '&extproc=paypal' + '&finish_error_redirect=' + $('input[name="finish_error_redirect"]').val() + '&finish_success_redirect=' + $('input[name="finish_success_redirect"]').val() + buildData;
            } else {
                var donationData = 'method=donate' + buildData;
            }
            console.log(donationData);
            return donationData;
        }

        function showResponse(data) {
            console.log(data);
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
                //Otherwise, send to thank you page
        		var donID  = getURLParameter(window.location.href, 'donID');
        		function getURLParameter(url, name) {
        			return (RegExp(name + '=' + '(.+?)(&|$)').exec(url)||[,null])[1];
        		}
                window.location.replace('https://secure2.convio.net/mskcc/site/SPageServer?pagename=donate_thanks&donID=' + donID);
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
    $('input.designate, input.tribute-check, input.ecard-check, input.ship-check').on('change', function() {
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

    //Select ecard type
    $('.ecard-temp').click(function() {
        var self = $(this);
        $('.ecard-temp').removeClass('active');
        self.addClass('active');
    });

    $('input[type="text"]').keyup(function() {
        var str = $(this).val();
        if(str.indexOf('&') >= 0) {
            str = str.replace(/&/g, "and");
            console.log(str);
            $(this).val(str);
        }
    });

    //
    function changeAmp() {
        var str = document.form.tribute_notify_name_full.value;
        str = str.replace(/&/g, "and");
        console.log(str);
        document.form.tribute_notify_name_full.value = str;
    };

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

    //Leave at the end of function
    if ($('label.other').hasClass('checked')) {
        checkedLevelFocus();
    }
}

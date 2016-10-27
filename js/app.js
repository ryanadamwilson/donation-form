(function() {

	var app = angular.module('donate', []);

	// This controls the API call for the form information
	// retrieval and population to the correct fields

	// UIHandlers function must be called in callback
	// or else it won't run.
	app.controller('fieldController', function($scope) {
		var self = this;
		var getDonationFormInfo = function(data) {
			console.log(data);
			if (data.getDonationFormInfoResponse) {
				$scope.$apply(function () {
					self.data = data.getDonationFormInfoResponse;
					self.levels = data.getDonationFormInfoResponse.donationLevels.donationLevel;
				});
				UIHandlers();
			} else if (data.errorResponse.message.indexOf('not found' >= 0)){
				window.location.replace(donationRedirect);
			}
		};

		var transSumm = ["Transaction Date", "Level", "Amount", "How would you like your name to scroll?", "Personal Note", "Title", "First Name", "Last Name", "Email Address", "Street 1", "Street 2", "City", "State/Province", "Zip/Postal Code", "Country", "Payment type", "Credit Card Number", "Updates"];

		luminateExtend.api({
			api: 'CRDonationAPI',
			data:   'method=getDonationFormInfo&form_id=' + $('input[name="form_id"]').val(),
			requestType: 'GET',
			requiresAuth: false,
			callback: getDonationFormInfo
		});
	});

	app.controller('formController', function($scope, $element) {
		$scope.amount = {'display' : 'Amount', 'value': ''};
		$scope.scrollName = {'display' : 'How would you like your name to scroll?', 'value': 'Anonymous'};
		$scope.personalNote = {'display' : 'Personal Note', 'value': ''};
		$scope.donorTitle = {'display' : 'Title (optional)', 'value': ''};
		$scope.firstName = {'display' : 'First Name', 'value': ''};
		$scope.lastName = {'display' : 'Last Name', 'value': ''};
		$scope.email = {'display' : 'Email', 'value': ''};
		$scope.street1 = {'display' : 'Street 1', 'value': ''};
		$scope.street2 = {'display' : 'Street 2 (optional)', 'value': ''};
		$scope.city = {'display' : 'City', 'value': ''};
		$scope.state = {'display' : 'State/Province', 'value': ''};
		$scope.zip = {'display' : 'Zip/Postal Code', 'value': ''};
		$scope.country = {'display' : 'Country', 'value': ''};
		$scope.pymtType = {'display' : 'Payment Type', 'value': 'Credit Card'};
		$scope.cardNumber = {'display' : 'Card Number', 'value': ''};
		// $scope.cardCvv = {'display' : 'Card CVV', 'value': ''};
		$scope.cardExMonth = {'display' : 'Card Expiration Month', 'value': ''};
		$scope.cardExYear = {'display' : 'Card Expiration Year', 'value': ''};
		$scope.updates = {'display' : 'Updates', 'value': 'Yes'};
		$scope.tributeType = {'display' : 'Tribute Type', 'value': ''};
		$scope.tributeName = {'display' : 'Tribute Name', 'value': ''};
		$scope.noteName = {'display' : 'Notification Full Name', 'value': ''};
		$scope.noteStreet1 = {'display' : 'Notification Street 1', 'value': ''};
		$scope.noteStreet2 = {'display' : 'Notification Street 2 (optional)', 'value': ''};
		$scope.noteCity = {'display' : 'Notification City', 'value': ''};
		$scope.noteState = {'display' : 'Notification State/Province', 'value': ''};
		$scope.noteZip = {'display' : 'Notification Zip/Postal Code', 'value': ''};
		$scope.noteCountry = {'display' : 'Notification Country', 'value': ''};
		$scope.formData = [
			$scope.amount, $scope.scrollName, $scope.personalNote, $scope.donorTitle, $scope.firstName, $scope.lastName, $scope.email, $scope.street1, $scope.street2, $scope.city, $scope.state, $scope.zip, $scope.country, $scope.pymtType, $scope.cardNumber, $scope.cardExMonth, $scope.cardExYear, $scope.updates
		];
		$scope.tribData = [
			$scope.tributeType, $scope.tributeName, $scope.noteName, $scope.noteStreet1, $scope.noteStreet2, $scope.noteCity, $scope.noteState, $scope.noteZip, $scope.noteCountry
		];

		$scope.carouselSlide = function (direction) {
	        $('#donationForm').carousel(direction);
	    };
		$scope.donationerror = false;
		$scope.showerror = false;
		$scope.showError = function(e) {
			var elem = e.target;
			$(elem).closest('.item').find('.has-error').addClass('submitted');
			$(elem).closest('.item').find('.has-error').removeClass('pristine');
			$scope.showerror = true;
		};
		$scope.showLevelError = function(e) {
			// var elem = e.target;
			// $(elem).closest('.item').find('.has-error').addClass('submitted');
			// $(elem).closest('.item').find('.has-error').removeClass('pristine');
			$scope.donationerror = true;
		};

		$scope.hideError = function() {
			$scope.showerror = false;
			$scope.donationerror = false;
		};
		$scope.readMore = function() {
			if($('#PersonalNote').height() > 110) {
		        $('#PersonalNote').addClass('readmore');
		    }
		}
	});


	//Get the designees for this form
	app.controller('programController', function($scope) {
		var self = this;
		var getDesignees = function(data) {
			$scope.$apply(function () {
				self.designees = data.getDesigneesResponse.designee;
			});
		};

		luminateExtend.api({
			api: 'CRDonationAPI',
			data:   'method=getDesignees&form_id=' + $('input[name="form_id"]').val(),
			requestType: 'GET',
			requiresAuth: false,
			callback: getDesignees
		});
	});

	//Programatically build years in form, so that we don't have to update manually
	//Also the months, just for fun. And I don't like lists
	app.controller('dateController', function($scope) {

		var year = new Date().getFullYear();
		var range = [];
		range.push(year);
		for(var i=1;i<7;i++) {
			range.push(year + i);
		}
		this.years = range;
		this.months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
		$scope.selectedMonth = new Date().getMonth() + 1;
	});

	//A nice object of the states/countries because I don't like big lists in my HTML :)
	app.controller('stateController', function($scope) {
		this.state = states;
		this.abbreviation = abbreviations;
		this.country = countries;
	});
	var abbreviations = ["AK","AL","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
	var states = [
	    {
	        "name": "Alabama",
	        "abbreviation": "AL"
	    },
	    {
	        "name": "Alaska",
	        "abbreviation": "AK"
	    },
	    {
	        "name": "American Samoa",
	        "abbreviation": "AS"
	    },
	    {
	        "name": "Arizona",
	        "abbreviation": "AZ"
	    },
	    {
	        "name": "Arkansas",
	        "abbreviation": "AR"
	    },
	    {
	        "name": "California",
	        "abbreviation": "CA"
	    },
	    {
	        "name": "Colorado",
	        "abbreviation": "CO"
	    },
	    {
	        "name": "Connecticut",
	        "abbreviation": "CT"
	    },
	    {
	        "name": "Delaware",
	        "abbreviation": "DE"
	    },
	    {
	        "name": "District Of Columbia",
	        "abbreviation": "DC"
	    },
	    {
	        "name": "Federated States Of Micronesia",
	        "abbreviation": "FM"
	    },
	    {
	        "name": "Florida",
	        "abbreviation": "FL"
	    },
	    {
	        "name": "Georgia",
	        "abbreviation": "GA"
	    },
	    {
	        "name": "Guam",
	        "abbreviation": "GU"
	    },
	    {
	        "name": "Hawaii",
	        "abbreviation": "HI"
	    },
	    {
	        "name": "Idaho",
	        "abbreviation": "ID"
	    },
	    {
	        "name": "Illinois",
	        "abbreviation": "IL"
	    },
	    {
	        "name": "Indiana",
	        "abbreviation": "IN"
	    },
	    {
	        "name": "Iowa",
	        "abbreviation": "IA"
	    },
	    {
	        "name": "Kansas",
	        "abbreviation": "KS"
	    },
	    {
	        "name": "Kentucky",
	        "abbreviation": "KY"
	    },
	    {
	        "name": "Louisiana",
	        "abbreviation": "LA"
	    },
	    {
	        "name": "Maine",
	        "abbreviation": "ME"
	    },
	    {
	        "name": "Marshall Islands",
	        "abbreviation": "MH"
	    },
	    {
	        "name": "Maryland",
	        "abbreviation": "MD"
	    },
	    {
	        "name": "Massachusetts",
	        "abbreviation": "MA"
	    },
	    {
	        "name": "Michigan",
	        "abbreviation": "MI"
	    },
	    {
	        "name": "Minnesota",
	        "abbreviation": "MN"
	    },
	    {
	        "name": "Mississippi",
	        "abbreviation": "MS"
	    },
	    {
	        "name": "Missouri",
	        "abbreviation": "MO"
	    },
	    {
	        "name": "Montana",
	        "abbreviation": "MT"
	    },
	    {
	        "name": "Nebraska",
	        "abbreviation": "NE"
	    },
	    {
	        "name": "Nevada",
	        "abbreviation": "NV"
	    },
	    {
	        "name": "New Hampshire",
	        "abbreviation": "NH"
	    },
	    {
	        "name": "New Jersey",
	        "abbreviation": "NJ"
	    },
	    {
	        "name": "New Mexico",
	        "abbreviation": "NM"
	    },
	    {
	        "name": "New York",
	        "abbreviation": "NY"
	    },
	    {
	        "name": "North Carolina",
	        "abbreviation": "NC"
	    },
	    {
	        "name": "North Dakota",
	        "abbreviation": "ND"
	    },
	    {
	        "name": "Northern Mariana Islands",
	        "abbreviation": "MP"
	    },
	    {
	        "name": "Ohio",
	        "abbreviation": "OH"
	    },
	    {
	        "name": "Oklahoma",
	        "abbreviation": "OK"
	    },
	    {
	        "name": "Oregon",
	        "abbreviation": "OR"
	    },
	    {
	        "name": "Palau",
	        "abbreviation": "PW"
	    },
	    {
	        "name": "Pennsylvania",
	        "abbreviation": "PA"
	    },
	    {
	        "name": "Puerto Rico",
	        "abbreviation": "PR"
	    },
	    {
	        "name": "Rhode Island",
	        "abbreviation": "RI"
	    },
	    {
	        "name": "South Carolina",
	        "abbreviation": "SC"
	    },
	    {
	        "name": "South Dakota",
	        "abbreviation": "SD"
	    },
	    {
	        "name": "Tennessee",
	        "abbreviation": "TN"
	    },
	    {
	        "name": "Texas",
	        "abbreviation": "TX"
	    },
	    {
	        "name": "Utah",
	        "abbreviation": "UT"
	    },
	    {
	        "name": "Vermont",
	        "abbreviation": "VT"
	    },
	    {
	        "name": "Virgin Islands",
	        "abbreviation": "VI"
	    },
	    {
	        "name": "Virginia",
	        "abbreviation": "VA"
	    },
	    {
	        "name": "Washington",
	        "abbreviation": "WA"
	    },
	    {
	        "name": "West Virginia",
	        "abbreviation": "WV"
	    },
	    {
	        "name": "Wisconsin",
	        "abbreviation": "WI"
	    },
	    {
	        "name": "Wyoming",
	        "abbreviation": "WY"
	    },
	    {
	        "name": "Armed Forces Americas",
	        "abbreviation": "AA"
	    },
	    {
	        "name": "Armed Forces Pacific",
	        "abbreviation": "AP"
	    },
	    {
	        "name": "Alberta",
	        "abbreviation": "AB"
	    },
	    {
	        "name": "British Columbia",
	        "abbreviation": "BC"
	    },
	    {
	        "name": "Manitoba",
	        "abbreviation": "MB"
	    },
	    {
	        "name": "New Brunswick",
	        "abbreviation": "NB"
	    },
	    {
	        "name": "Newfoundland and Labrador",
	        "abbreviation": "NL"
	    },
	    {
	        "name": "Nova Scotia",
	        "abbreviation": "NS"
	    },
	    {
	        "name": "Northwest Territories",
	        "abbreviation": "NT"
	    },
	    {
	        "name": "Nunavut",
	        "abbreviation": "NU"
	    },
	    {
	        "name": "Ontario",
	        "abbreviation": "ON"
	    },
	    {
	        "name": "Prince Edward Island",
	        "abbreviation": "PE"
	    },
	    {
	        "name": "Quebec",
	        "abbreviation": "QC"
	    },
	    {
	        "name": "Saskatchewan",
	        "abbreviation": "SK"
	    },
	    {
	        "name": "Yukon",
	        "abbreviation": "YT"
	    },
	    {
	        "name": "None",
	        "abbreviation": "None"
	    }
	];
	var countries = ["United States", "Canada","Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi", "Cambodia", "Cameroon", "Cape Verde", "Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica"
		,"Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea"
		,"Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana"
		,"Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India"
		,"Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia"
		,"Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania"
		,"Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia"
		,"New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal"
		,"Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles"
		,"Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","St. Lucia","Sudan"
		,"Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia"
		,"Turkey","Turkmenistan","Turks & Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","US Minor Outlying Islands","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)"
		,"Yemen","Zambia","Zimbabwe"];
})();

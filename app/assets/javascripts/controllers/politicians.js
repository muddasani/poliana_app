var $key = $('.primary-key');

// If this is a single politician page
if($key.length > 0) {
	// Get our bioguide
	var bioguide = $key.attr('data-id');
	var startDate = $key.attr('data-start');
	var endDate = $key.attr('data-end');

	// Define our controller
	var cont = ge.controller();

	// Get all the PACS
	var getPacs = $.get('http://poliana-staging.elasticbeanstalk.com/politicians/' + bioguide + '/contributions/pacs', { start: startDate, end: endDate, unit: 'congress', apikey: apiKey }, function(data) {
	//var getPacs = $.get('/temp/pacs.json', function(data) {
		var $barSelector = $('#pacs-bar');

		var title = "Top 5 PAC Contributors";

		var $info = $('<div>')
			.addClass('other hide')
			.html("<h3 class='text-center'>What is a PAC?</h3><p>A political action committee (PAC) is an organization that raises and spends campaign contributions for the express purpose of advocating for the election or defeat of candidates seeking federal office. Typically associated with business, labor, or ideological interests, its contributions are considered “hard money”. The Federal Election Commission places limits on how much an individual can give to a PAC as well as how much a PAC can give directly to a candidate.</p><p>In this chart, we see the top 5 PACs that advocated in favor of a politician during a certain time range. Note that these figures include expenditures far beyond direct contributions to the candidate. Move and expand the timeline to see how these PAC contributions have changed over time.</p><p><a href='http://wiki.poliana.com/index.php/Political_Action_Committees_(PACs)' target='_blank'>Click here to know more?</a></p>" + dataPartners);

		$barSelector.append($('<h4>')
			.addClass('text-center')
			.text(title)
		);

		$barSelector.append($info);

		// Format data from API return to our specifications
		var transform = {};
		var firstItem = data[Object.keys(data)[0]][0];

		transform.bioguide_id = firstItem.bioguide_id;
		transform.first_name = firstItem.first_name;
		transform.last_name = firstItem.last_name;
		transform.party = firstItem.party;
		transform.religion = firstItem.religion;
		transform.contributions = [];

		for(var key in data) {
			for(var i = 0; i < data[key].length; i++) {
				var item = data[key][i];
				transform.contributions.push({
					congress: item.congress,
					contribution_count: item.contribution_count,
					contribution_sum: item.contribution_sum,
					pac_id: item.pac_id,
					pac_name: item.pac_name
				});
			}
		}

		var cf = crossfilter(transform.contributions);

		var cfCongress = cf.dimension(function(c) { return +c.congress; });
		var cfNames = cf.dimension(function(c) { return c.pac_name; });

		var cfNamesReduce = cfNames.group().reduceSum(function(c) { return +c.contribution_sum; });
		var pacReduced = cfCongress.group().reduceSum(function(c) { return +c.contribution_sum; });

		var pacTotals = pacReduced.all();
		$.each(pacTotals, function(key, value) { pacTotals[key].group = "All PACs"; });

		data.totals = pacTotals;

		var pacsBar = ge.graph({
			type: 'verticalBar',
			width: 400,
			height: 300,
			selector: $barSelector,
			margins: {
				top: 30,
				bottom: 15,
				left: 0,
				right: 0
			},
			colors: warmColors,
			data: cf,
			dimensions: [
				{
					data: cfNamesReduce,
					keySelector: 'key',
					valueSelector: 'value'
				},
				{
					data: cfCongress,
					keySelector: 'pac_name',
					valueSelector: 'contribution_sum'
				}
			],
			size: 5,
			filterDimension: 1
		});

		cont.addGraph(pacsBar);
	});

	// Get all the industries
	var getIndustries = $.get('http://poliana-staging.elasticbeanstalk.com/politicians/' + bioguide + '/contributions/industries', { start: startDate, end: endDate, unit: 'congress', apikey: apiKey }, function(data) {
	//var getIndustries = $.get('/temp/industries.json', function(data) {
		var $barSelector = $('#industries-bar');

		var title = "Top 5 Industry Contributors";

		var $info = $('<div>')
			.addClass('other hide')
			.html("<h3 class='text-center'>What is an industry?</h3><p>Each business sector in the United States has its own special interests, and each contributes heavily to candidates who will advance those interests. In this chart, the totals represent the aggregate amount of contributions from all individuals, businesses, and PACs associated with a particular industry and made in favor of this politician for the given timerange. Move and expand the scrubber to see how these industry contributions have changed over time.</p><p><a href='http://wiki.poliana.com/index.php/Industries' target='_blank'>Click here to know more?</a></p>" + dataPartners);

		$barSelector.append($('<h4>')
			.addClass('text-center')
			.text(title)
		);

		$barSelector.append($info);

		// Format data from API return to our specifications
		var transform = {};
		var firstItem = data[Object.keys(data)[0]][0];

		transform.bioguide_id = firstItem.bioguide_id;
		transform.first_name = firstItem.first_name;
		transform.last_name = firstItem.last_name;
		transform.party = firstItem.party;
		transform.religion = firstItem.religion;
		transform.contributions = [];

		for(var key in data) {
			for(var i = 0; i < data[key].length; i++) {
				var item = data[key][i];
				transform.contributions.push({
					congress: item.congress,
					contribution_count: item.contribution_count,
					contribution_sum: item.contribution_sum,
					industry_id: item.industry_id,
					industry_name: item.industry_name,
					sector: item.sector,
					sector_long: item.sector_long
				});
			}
		}

		var cf = crossfilter(transform.contributions);

		var cfCongress = cf.dimension(function(c) { return +c.congress; });
		var cfNames = cf.dimension(function(c) { return c.industry_name; });

		var cfNamesReduce = cfNames.group().reduceSum(function(c) { return +c.contribution_sum; });
		var industryReduced = cfCongress.group().reduceSum(function(c) { return +c.contribution_sum; });

		var industryTotals = industryReduced.all();
		$.each(industryTotals, function(key, value) { industryTotals[key].group = "All Industries"; });

		data.totals = industryTotals;

		var industriesBar = ge.graph({
			type: 'verticalBar',
			width: 400,
			height: 300,
			selector: $barSelector,
			margins: {
				top: 30,
				bottom: 15,
				left: 0,
				right: 0
			},
			colors: coolColors,
			data: cf,
			dimensions: [
				{
					data: cfNamesReduce,
					keySelector: 'key',
					valueSelector: 'value'
				},
				{
					data: cfCongress,
					keySelector: 'industry_name',
					valueSelector: 'contribution_sum'
				}
			],
			size: 5,
			filterDimension: 1
		});

		cont.addGraph(industriesBar);
	});

	// Tell jQuery's AJAX to be patient
	$.when(getPacs, getIndustries).done(function(pacs, industries) {
		// Hide the loader
		$loader.fadeOut(250, function() {
			var $timelineArea = $('#timeline-area');
			var $timelineSelect = $('#timeline-select');

			var title = "Timeline";

			$timelineArea.append($('<h4>')
				.text(title)
			);

			var allData = [];

			sumArrays(pacs[0].totals, allData);
			sumArrays(industries[0].totals, allData);

			function sumArrays(array, finalArray) {
				$.each(array, function() {
					var orig = this;
					var count = 0;

					$.each(finalArray, function() {
						if(this.key == orig.key) {
							count++;

							if(orig.value > 0)
								this.value += orig.value;
						}
					});

					if(count === 0) {
						if(orig.value >= 0)
							finalArray.push({ group: "Total Contributions", key: orig.key, value: orig.value });
						else
							finalArray.push({ group: "Total Contributions", key: orig.key, value: 0 });
					}
				});
			}

			var timelineScrub = ge.graph({
				type: 'scrubber',
				width: 940,
				height: 100,
				selector: $timelineArea,
				secondarySelector: $timelineSelect,
				margins: {
					top: 20,
					bottom: 20,
					left: 0,
					right: 0
				},
				colors: monoColors,
				data: [ allData ],
				controller: cont
			});

			cont.addGraph(timelineScrub);

			// Let's rock and roll
			cont.render();

			$timelineSelect.find('option').each(function() {
				if($(this).val() !== "all") {
					var value = parseInt($(this).val()).ordinate();
					var found = false;

					$timelineArea.find('.tick-text').each(function() {
						if($(this).text() === value)
							found = true;
					});

					if(!found)
						$(this).remove();
				}
			});

			// No need for this shit anymore...
			$('.primary-key').remove();
		});
	});
}
else {
	var dataHold;
	var $searchForm = $('#politician-search');
	var $map = $('#politician-index-map');
	var $politiciansList = $('#politician-search-list');
	var $politiciansPagination = $('#politicians-list-pagination');

	$.xhrPool = [];

	function abortAll(xhr) {
		$.each($.xhrPool, function(idx, jqXHR) {
			jqXHR.abort();
		});

		$.xhrPool = [];
		$.xhrPool.push(xhr);
	};

	$.ajaxSetup({
		beforeSend: function(jqXHR) {
			abortAll(jqXHR);

			$loader.fadeIn(250);
		},
		complete: function(jqXHR) {
			var index = $.xhrPool.indexOf(jqXHR);

			if(index > -1)
				$.xhrPool.splice(index, 1);
		}
	});

	$searchForm.on('submit', function(event) {
		event.preventDefault();
	});

	var $allInputs = {
		query: $searchForm.find('input[name=query]'),
		state: $searchForm.find('select[name=state]'),
		type: $searchForm.find('input[name=type]'),
		party: $searchForm.find('input[name=party]'),
		gender: $searchForm.find('select[name=gender]'),
		religion: $searchForm.find('input[name=religion]'),
		sort: $searchForm.find('select[name=sort]'),
		congress: $searchForm.find('select[name=congress]')
	};

	var inputListSelectors = [];
	var querySortSelectors = [];

	$.each($allInputs, function() {
		inputListSelectors.push($(this).selector);
	});

	// Default number of results to show
	var resultsNum = 5;

	$(window).bind('popstate', function(event) {
		var newQueryString = window.history.state;

		console.log(newQueryString);

		$.each($allInputs, function() {
			// Checkboxes
			if($(this).size() > 1) {
				$(this).each(function() {
					if(typeof newQueryString[$(this).attr('name')] != "undefined") {
						if(newQueryString[$(this).attr('name')].indexOf($(this).val()) != -1)
							$(this).prop('checked', true);
						else
							$(this).prop('checked', false);
					}
					else
						$(this).prop('checked', false);
				});
			}
			else {
				// Selects
				if($(this).is('select')) {
					if(typeof newQueryString[$(this).attr('name')] != "undefined")
						$(this).val(newQueryString[$(this).attr('name')]);
					else
						$(this).val($(this).find('option:first').val());
				}
				else {
					// Text inputs
					if(typeof newQueryString[$(this).attr('name')] != "undefined")
						$(this).val(newQueryString[$(this).attr('name')]);
					else
						$(this).val('');
				}
			}
		});

		makeQuery(window.history.state);
	});

	// We need to make an AJAX call
	$(inputListSelectors.join()).on('change', function() {
		var queryString = gatherInputs();

		history.pushState(queryString, "", window.location.href.split('?')[0] + "?" + decodeURIComponent($.param(queryString)));

		$sharable.find('span').each(function() {
			if($(this).hasClass('icon-facebook'))
				$(this).parent('a').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href));
			if($(this).hasClass('icon-twitter'))
				$(this).parent('a').attr('href', 'https://twitter.com/home?status=' + encodeURIComponent(window.location.href));
			if($(this).hasClass('icon-googleplus'))
				$(this).parent('a').attr('href', 'https://plus.google.com/share?url=' + encodeURIComponent(window.location.href));
			if($(this).hasClass('icon-linkedin'))
				$(this).parent('a').attr('href', 'https://www.linkedin.com/shareArticle?&url=' + encodeURIComponent(window.location.href));
		});

		resultsNum = 5;

		makeQuery(queryString);
	});

	function makeQuery(queryString) {
		$.ajax({
			url: "/congress/politicians?format=json",
			data: queryString
		}).done(function(data) {
			$politiciansList.fadeOut(250, function() {
				$politiciansPagination.hide();
				scrollToPos(0);
				prepareData(data);
			});
		});
	}

	// Trigger the first one
	$allInputs.query.trigger('change');

	// We need to load more politicians in, no call or anything needed
	$(document).on('click', $politiciansPagination.selector, function(event) {
		event.preventDefault();

		if(dataHold.length > resultsNum)
			resultsNum += 5;
		else
			resultsNum = 5;

		prepareData(dataHold);
	});

	function gatherInputs() {
		// Prepare the query data
		var queryString = {};

		// Populate it
		$.each($allInputs, function() {
			if($(this).size() > 1) {
				var checked = [];

				$(this).each(function() {
					if($(this).is(':checked'))
						checked.push($(this).val());
				});

				checked = checked.join();

				if(checked !== "")
					queryString[$(this).attr('name')] = checked;
			}
			else if($(this).size() === 1 && $(this).val() != "" && $(this).val() != "all")
				queryString[$(this).attr('name')] = $(this).val();
		});

		return queryString;
	}

	function prepareData(data) {
		// Hold on to the information
		dataHold = data;

		// Filter by query first
		var queryVal = $allInputs.query.val().toLowerCase();
		var temp = [];

		$.each(data, function() {
			var fName = this.first_name.toLowerCase();
			var lName = this.last_name.toLowerCase();
			var fName = fName + " " + lName;

			if(fName.indexOf(queryVal) != -1 || lName.indexOf(queryVal) != -1 || fName.indexOf(queryVal) != -1)
				temp.push(this);
		});

		data = temp;

		// Now sort all the rows
		var congressVal = $allInputs.congress.val();
		var sortVal = $allInputs.sort.val();

		$.each(data, function() {
			var poli = this;
			var contrib = poli.contributions;

			poli.pacTotal = 0;
			poli.industryTotal = 0;
			poli.total = 0;

			if(congressVal == "all") {
				$.each(contrib, function() {
					poli.pacTotal += parseInt(this.pac);
					poli.industryTotal += parseInt(this.industry);
				});
			}
			else {
				poli.pacTotal = parseInt(contrib[congressVal].pac);
				poli.industryTotal = parseInt(contrib[congressVal].industry);
			}

			poli.total = poli.pacTotal + poli.industryTotal;
		});

		if(sortVal === "total-desc")
			data.sort(dynamicSort("-total"));
		else if(sortVal === "total-asc")
			data.sort(dynamicSort("total"));
		else if(sortVal === "pac-desc")
			data.sort(dynamicSort("-pacTotal"));
		else if(sortVal === "pac-asc")
			data.sort(dynamicSort("pacTotal"));
		else if(sortVal === "industry-desc")
			data.sort(dynamicSort("-industryTotal"));
		else if(sortVal === "industry-asc")
			data.sort(dynamicSort("industryTotal"));
		else if(sortVal === "age-desc")
			data.sort(dynamicSort("percent_age_difference"));
		else if(sortVal === "age-asc")
			data.sort(dynamicSort("-percent_age_difference"));

		var finalData = [];

		// Remove politicians if congress is specified and term is wrong
		if(congressVal != "all") {
			var typeVal = [];
			var typeSelector = $allInputs.type.selector;

			$(typeSelector).each(function() {
				if($(this).is(':checked'))
					typeVal.push($(this).val());
			});

			if(typeVal.length > 0) {
				$.each(data, function(index) {
					var found = false;

					$.each(this.terms, function() {
						if(typeVal.indexOf(this.term_type) == -1 && this.congresses.indexOf(congressVal) == -1)
							found = true;
					});

					if(!found)
						finalData.push(this);
				});
			}
			else
				finalData = data;
		}
		else
			finalData = data;

		formatData(finalData);
	}

	function formatData(data) {
		var sortVal = $allInputs.sort.val();
		var queryVal = $allInputs.query.val();

		$politiciansList.html('');

		function getHeading() {
			var string = "";
			var number = resultsNum;

			if(data.length < number)
				number = data.length;

			if(sortVal === "total-desc")
				string += "Top " + number + " Highest Earning Politicians";
			else if(sortVal === "total-asc")
				string += "Top " + number + " Lowest Earning Politicians";
			else if(sortVal === "pac-desc")
				string += "Top " + number + " Highest Earning Politicians from PACs";
			else if(sortVal === "pac-asc")
				string += "Top " + number + " Lowest Earning Politicians from PACs";
			else if(sortVal === "industry-desc")
				string += "Top " + number + " Highest Earning Politicians from Industries";
			else if(sortVal === "industry-asc")
				string += "Top " + number + " Lowest Earning Politicians from Industries";
			else if(sortVal === "age-desc")
				string += "Top " + number + " Oldest Politicians";
			else if(sortVal === "age-asc")
				string += "Top " + number + " Youngest Politicians";

			return string;
		}

		function getSubheading() {
			var string = [];
			var info = gatherInputs();

			if(Object.keys(info).length > 1) {
				$.each(info, function(key, value) {
					if(key == "state")
						string.push(" from " + convertState(value, 'name'));

					if(key == "type")
						string.push(multipleSentence(value, "type"));

					if(key == "party")
						string.push(multipleSentence(value, "party"));

					if(key == "gender")
						string.push(filterType(value, "gender"));

					if(key == "religion")
						string.push(multipleSentence(value, "religion"));

					if(key == "congress")
						string.push("in the " + parseInt(value).ordinate() + " congress");
				});
			}
			else
				return "";

			function filterType(input, kind) {
				if(kind == "type") {
					if(input == "prez")
						return "Presidents";
					else if(input == "viceprez")
						return "Vice Presidents";
					else if(input == "sen")
						return "Senators";
					else if(input == "rep")
						return "Represenatives";
				}
				else if(kind == "gender") {
					if(input == "M")
						return "Male"
					else if(input == "F")
						return "Female";
				}
				else
					return input;
			}

			function multipleSentence(value, kind) {
				var allVals = value.split(',');

				if(allVals.length == 1)
					return filterType(allVals[0], kind);
				else if(allVals.length == 2)
					return filterType(allVals[0], kind) + " or " + filterType(allVals[1], kind);
				else {
					var longValue = "either ";
					var i = 0;

					$.each(allVals, function() {
						if(allVals.length - 1 == i)
							longValue += "or " + filterType(allVals[i], kind);
						else
							longValue += filterType(allVals[i], kind) + ", ";

						i++;
					});

					return longValue;
				}
			}

			var finalLength = string.length;
			var finalString = string.join(', ');

			if(finalLength > 1)
				finalString = finalString.splice(finalString.lastIndexOf(', ') + 1, 0, " and");

			if(queryVal != "")
				finalString += " named '" + queryVal + "'";

			return "That are " + finalString;
		}

		var heading = getHeading();
		var subHeading = getSubheading();

		$map.siblings('h3').html(heading);
		$map.siblings('.gray-caps').html(subHeading);

		var $mainHeader = $('#content h1');
		var resultsCounter = 0;

		if(data.length > 0) {
			var congress = $allInputs.congress.val();
			var currentDate = new Date();

			$mainHeader.html(data.length + " politicians found");

			var typesRequested = {};

			if(subHeading.indexOf('Presidents') != -1)
				typesRequested.prez = [];

			if(subHeading.indexOf('Vice Presidents') != -1)
				typesRequested.viceprez = [];

			if(subHeading.indexOf('Senators') != -1)
				typesRequested.sen = [];

			if(subHeading.indexOf('Represenatives') != -1)
				typesRequested.rep = [];

			$.each(data, function() {
				if(resultsCounter < resultsNum) {
					var poli = this;

					// Sort their terms
					poli.terms.sort(dynamicSort("start"));

					$politiciansList.append($('<li>')
						.append($('<div>')
							.addClass('picture')
							.css('background-image', 'url(\'' + this.image_url + '\')')
						)
						.append($('<div>')
							.append($('<ul>')
								.addClass('politician-card ' + this.party.toLowerCase())
								.append($('<li>')
									.html(convertParty(this.party, "abbrev"))
								)
								.append($('<li>')
									.html(this.state)
								)
							)
						)
						.append($('<div>')
							.addClass('politician-info')
							.append($('<a>')
								.attr('href', '/congress/politicians/' + this.bioguide_id)
								.append($('<h5>')
									.html(this.first_name + " " + this.last_name)
								)
								.append($('<p>')
									.addClass('role')
									.html(function() {
										var roleString = "";
										var currentTermEndDate = new Date(poli.terms[poli.terms.length - 1].end);

										if(currentTermEndDate.getTime() - currentDate.getTime() >= 0)
											roleString += "Currently " + convertType(poli.terms[poli.terms.length - 1].term_type, "name");

										if(Object.keys(typesRequested).length > 0) {
											var poliTypesRequested = {};

											$.each(poli.terms, function() {
												var termType = this.term_type;

												if(typeof typesRequested[termType] != "undefined") {
													if(typeof poliTypesRequested[termType] == "undefined")
														poliTypesRequested[termType] = [];

													$.each(this.congresses, function(index, value) { poliTypesRequested[termType].push(value.ordinate()); });
												}
											});

											$.each(poliTypesRequested, function(key, value) {
												if(roleString != "")
													roleString += ", ";

												roleString += convertType(key, "name") + " (" + value.join(', ') + ")";
											});
										}
										else {
											var termTypes = [];

											if(roleString == "") {
												$.each(poli.terms, function() {
													if(termTypes.indexOf(convertType(this.term_type, "name")) == -1 && this.term_type != null)
														termTypes.push(convertType(this.term_type, "name"));
												});
											}
											else {
												$.each(poli.terms, function() {
													if(convertType(this.term_type, "name") != roleString.substring(roleString.indexOf(' ') + 1)) {
														if(termTypes.indexOf(convertType(this.term_type, "name")) == -1 && this.term_type != null)
															termTypes.push(convertType(this.term_type, "name"));
													}
												});
											}

											if(roleString != "")
												roleString += ", formerly ";

											roleString += termTypes.join(', ');
										}

										return roleString;
									})
								)
								.append($('<p>')
									.addClass('important')
									.html(function() {
										if(congress == "all") {
											var total, pacTotal, industryTotal;

											if(poli.total < 0)
												total = "-$" + commaSeparateNumber(Math.abs(poli.total));
											else
												total = "$" + commaSeparateNumber(poli.total);

											if(poli.pacTotal < 0)
												pacTotal = "-$" + commaSeparateNumber(Math.abs(poli.pacTotal));
											else
												pacTotal = "$" + commaSeparateNumber(poli.pacTotal);

											if(poli.industryTotal < 0)
												industryTotal = "-$" + commaSeparateNumber(Math.abs(poli.industryTotal));
											else
												industryTotal = "$" + commaSeparateNumber(poli.industryTotal);

											if(sortVal == "total-desc" || sortVal == "total-asc")
												return '<span>' + total + '</span> in contributions';
											else if(sortVal == "pac-desc" || sortVal == "pac-asc")
												return '<span>' + pacTotal + '</span> in PAC contributions';
											else if(sortVal == "industry-desc" || sortVal == "industry-asc")
												return '<span>' + industryTotal + '</span> in industry contributions';
										}
										else {
											var total, pacTotal, industryTotal;

											if(poli.contributions[congress].pac + poli.contributions[congress].industry < 0)
												total = "-$" + commaSeparateNumber(Math.abs(poli.contributions[congress].pac + poli.contributions[congress].industry));
											else
												total = "$" + commaSeparateNumber(poli.contributions[congress].pac + poli.contributions[congress].industry);

											if(poli.contributions[congress].pac < 0)
												pacTotal = "-$" + commaSeparateNumber(Math.abs(poli.contributions[congress].pac));
											else
												pacTotal = "$" + commaSeparateNumber(poli.contributions[congress].pac);

											if(poli.contributions[congress].industry < 0)
												industryTotal = "-$" + commaSeparateNumber(Math.abs(poli.contributions[congress].industry));
											else
												industryTotal = "$" + commaSeparateNumber(poli.contributions[congress].industry);

											if(sortVal == "total-desc" || sortVal == "total-asc")
												return '<span>' + total + '</span> in contributions';
											else if(sortVal == "pac-desc" || sortVal == "pac-asc")
												return '<span>' + pacTotal + '</span> in PAC contributions';
											else if(sortVal == "industry-desc" || sortVal == "industry-asc")
												return '<span>' + industryTotal + '</span> in industry contributions';
										}

										if(sortVal == "age-desc" || sortVal == "age-asc")
											return 'Older than <span>' + (100 - parseInt(poli.percent_age_difference)) + '%</span> of Congress';
									})
								)
							)
						)
					);
				}
				else
					return false;

				resultsCounter++;
			});

			$loader.fadeOut(250, function() {
				$politiciansList.fadeIn(250);
				$politiciansPagination.show();
			});

			$('#politicians-list-pagination').remove();

			if(data.length - resultsNum > 0) {
				$politiciansList.after($('<div>')
					.attr('id', 'politicians-list-pagination')
					.append($('<a>')
						.attr('href', '#')
						.html('Load more politicians...')
					)
				);
			}
		}
		else {
			$mainHeader.html("Search All Politicians");

			$map.siblings('h3').html("");
			$map.siblings('.gray-caps').html("");

			$politiciansList.html('<p>Sorry, no politicians fit that request!</p>');
			$('#politicians-list-pagination').remove();

			$loader.fadeOut(250, function() {
				$politiciansList.fadeIn(250);
			});
		}
	}
}

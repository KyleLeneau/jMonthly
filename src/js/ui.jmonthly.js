/*!
* Title:  jMonthly @VERSION
* Dependencies:  jQuery 1.3.0 + ui.core.js
* Author:  Kyle LeNeau
* Email:  kyle.leneau@gmail.com
* Project Hompage:  http://www.bytecyclist.com/projects/jmonthcalendar
* Source:  http://github.com/KyleLeneau/jMonthly
*
*/
(function($) {

$.widget("ui.jmonthly", {
	
	_init: function() {
		
		this.element.addClass("ui-jmonthly");

		// calendar object to track props.
		this._cal = new CalendarMonth().init(this.options.startDate);
		$.log(this._cal);
		
		
		this._drawCalendar(true);
		
		// draw events if passed in on init.
		if (this.options.events.length > 0) {
			this._drawEvents();
		}
	},
	
	_drawCalendar: function(init) {
		var o = this.options,
			c = this._cal,
			self = this,
			now = new Date().clearTime();
		
		var headerRow = this._drawHeader();
		
		// properties
		var cH = this.element.outerHeight(),
			rowHeight = (cH - o.headerHeight) / c.gridRows,
			row = null;
		
		
		//Build up the Body
		var tBody = $('<tbody></tbody>').addClass('ui-jmonthly-body');
		for (var i = 0; i < c.totalBoxes; i++) {
			var currentDate = c.dateRange.startDate.clone().addDays(i);
			if (i % 7 == 0 || i == 0) {
				row = $("<tr></tr>").addClass('ui-jmonthly-week');
				row.css({ "height" : rowHeight + "px" });
				tBody.append(row);
			}
			
			var weekday = (o.firstDayOfWeek + i) % 7;
			var attrs = {'class':'ui-jmonthly-datebox' + (weekday == 0 || weekday == 6 ? ' weekend ' : ''),
						'date':currentDate.toString("M/d/yyyy")
			};
			
			//DateBox Events
			var dateLink = $('<div><span>' + currentDate.getDate() + '</span></div>').addClass('ui-jmonthly-datelabel');
			dateLink.bind('click.jmonthly', currentDate.clone(), function(e) { 
				self._trigger("onDayTextClick", e, e.data);
			});
			
			var dateBox = $("<td></td>").attr(attrs).append(dateLink);
			dateBox.bind('dblclick.jmonthly', currentDate.clone(), function(e) {
				self._trigger('onDateBoxDoubleClick', e, e.data);
			});
			dateBox.bind('click.jmonthly', currentDate.clone(), function(e) {
				self._trigger('onDateBoxClick', e, e.data);
			});
			
			
			// dates outside of month range.
			if (currentDate.getMonth() != c.workingDate.getMonth()) {
				dateBox.addClass('inactive');
			}
			
			// check to see if current date rendering is today
			if (currentDate.isToday(now)) { 
				dateBox.addClass('today');
			}
			
			if (o.dragableEvents) {
				this._enableDropBox(dateBox);
			}
			
			this._cal.boxes.push(new CalendarDateBox(i, currentDate, dateBox, dateLink));
			row.append(dateBox);
		}
		tBody.append(row);

		var a = this.element;
		var cal = $('<table cellpadding="0" tablespacing="0"></table>').append(headerRow, tBody);
		
		a.hide();
		a.html(cal);
		a.fadeIn("normal");
		
		//_drawEventsOnCalendar();
	},
	
	_drawHeader: function() {
		var o = this.options,
			c = this._cal,
			self = this;
		
		// Create Previous Month link for later
		var pMonth = c.workingDate.clone().addMonths(-1);
		var prevMLink = $('<div class="MonthNavPrev"><a class="link-prev">'+ o.previousLinkText +'</a></div>').click(function() {
			self.changeMonth(pMonth);
		});
		
		if (!o.previousLink) { 
			prevMLink.addClass('ui-nav-disabled');
		}
		
		//Create Next Month link for later
		var nMonth = c.workingDate.clone().addMonths(1);
		var nextMLink = $('<div class="MonthNavNext"><a class="link-next">'+ o.nextLinkText +'</a></div>').click(function() {
			self.changeMonth(nMonth);
		});
		
		if (!o.nextLink) { 
			nextMLink.addClass('ui-nav-disabled');
		}
		
		
		//Create Previous Year link for later
		var prevYear = c.workingDate.clone().addYears(-1);
		var prevYLink = $('<div class="YearNavPrev"><a>'+ prevYear.getFullYear() +'</a></div>').click(function() {
			self.changeMonth(prevYear);
		});
		
		//Create Next Year link for later
		var nextYear = c.workingDate.clone().addYears(1);
		var nextYLink = $('<div class="YearNavNext"><a>'+ nextYear.getFullYear() +'</a></div>').click(function() {
			self.changeMonth(nextYear);
		});
		
		if (!o.yearLinks) { 
			prevYLink.addClass('ui-nav-disabled');
			nextYLink.addClass('ui-nav-disabled');
		}
		
		//Create Today link for later
		var todayLink = $('<div class="TodayLink"><a class="link-today">'+ o.todayLinkText +'</a></div>').click(function() {
			self.changeMonth(new Date());
		});
		
		if (!o.todayLink) { 
			todayLink.addClass('ui-nav-disabled');
		}
		

		//Build up the Header first,  Navigation
		var navRow = $('<tr><td colspan="7"><div class="FormHeader MonthNavigation"></div></td></tr>');
		var navHead = $('.MonthNavigation', navRow);
		
		navHead.append(prevMLink, nextMLink);
		navHead.append(todayLink);
		navHead.append($('<div class="MonthName"></div>').append(Date.CultureInfo.monthNames[c.workingDate.getMonth()] + " " + c.workingDate.getFullYear()));
		navHead.append(prevYLink);
		navHead.append(nextYLink);
		
		
		//  Days
		var headRow = $("<tr></tr>");		
		for (var i = o.firstDayOfWeek; i < o.firstDayOfWeek+7; i++) {
			var weekday = i % 7;
			var wordday = Date.CultureInfo.dayNames[weekday];
			headRow.append('<th title="' + wordday + '" class="DateHeader' + (weekday == 0 || weekday == 6 ? ' Weekend' : '') + '"><span>' + wordday + '</span></th>');
		}
		
		headRow = $("<thead id=\"CalendarHead\"></thead>").css({ "height" : o.headerHeight + "px" }).append(headRow);
		headRow = headRow.prepend(navRow);
		return headRow;
	},
	
	_enableDropBox: function(dateBox) {
		dateBox.droppable({
			hoverClass: this.options.dragHoverClass,
			tolerance: 'pointer',
			drop: function(ev, ui) {
				var eventId = ui.draggable.attr("eventid")
				var newDate = new Date($(this).attr("date")).clearTime();
				
				var event;
				$.each(cEvents, function() {
					if (this.EventID == eventId) {
						var days = new TimeSpan(newDate - this.StartDateTime).days;
						
						this.StartDateTime.addDays(days);
						this.EndDateTime.addDays(days);
														
						event = this;
					}
				});
				
				//$.J.ClearEventsOnCalendar();
				//_drawEventsOnCalendar();
				
				def.onEventDropped.call(this, event, newDate);
			}
		});
	},
	
	_drawEvents: function() {
		var cEvents = this.options.events,
			_boxes = this._cal.boxes,
			_cal = this._cal,
			self = this,
			_eventObj = {};
		
		//filter the JSON array for proper dates
		this._filterEvents();
		this.clearEvents();
		
		if (cEvents && cEvents.length > 0) {			
			$.each(cEvents, function(){
				var ev = this;
				//alert("eventID: " + ev.EventID + ", start: " + ev.StartDateTime + ",end: " + ev.EndDateTime);
				
				var tempStartDT = ev.StartDateTime.clone().clearTime();
				var tempEndDT = ev.EndDateTime.clone().clearTime();
				
				var startI = new TimeSpan(tempStartDT - _cal.dateRange.startDate).days;
				var endI = new TimeSpan(tempEndDT - _cal.dateRange.startDate).days;
				//alert("start I: " + startI + " end I: " + endI);
				
				var istart = (startI < 0) ? 0 : startI;
				var iend = (endI > _boxes.length - 1) ? _boxes.length - 1 : endI;
				//alert("istart: " + istart + " iend: " + iend);
				
				
				for (var i = istart; i <= iend; i++) {
					var b = _boxes[i];

					var startBoxCompare = tempStartDT.compareTo(b.date);
					var endBoxCompare = tempEndDT.compareTo(b.date);

					var continueEvent = ((i != 0 && startBoxCompare == -1 && endBoxCompare >= 0 && b.weekNumber != _boxes[i - 1].weekNumber) || (i == 0 && startBoxCompare == -1));
					var toManyEvents = (startBoxCompare == 0 || (i == 0 && startBoxCompare == -1) || 
										continueEvent || (startBoxCompare == -1 && endBoxCompare >= 0)) && b.vOffset >= (b.getCellBox().height() - b.getLabelHeight() - 32);
					
					//alert("b.vOffset: " + b.vOffset + ", cell height: " + (b.getCellBox().height() - b.getLabelHeight() - 32));
					//alert(continueEvent);
					//alert(toManyEvents);
					
					if (toManyEvents) {
						if (!b.isTooManySet) {
							var moreDiv = $('<div class="MoreEvents" id="ME_' + i + '">' + self.options.showMoreText + '</div>');
							var pos = b.getCellPosition();
							var index = i;

							moreDiv.css({ 
								"top" : (pos.top + (b.getCellBox().height() - b.getLabelHeight())), 
								"left" : pos.left, 
								"width" : (b.getLabelWidth() - 7),
								"position" : "absolute" });
							
							moreDiv.click(function(e) { _showMoreClick(e, index); });
							
							_eventObj[moreDiv.attr("id")] = moreDiv;
							b.isTooManySet = true;
						} //else update the +more to show??
						b.events.push(ev);
					} else if (startBoxCompare == 0 || (i == 0 && startBoxCompare == -1) || continueEvent) {
						var block = self._buildEventBlock(ev, b.weekNumber);						
						var pos = b.getCellPosition();
						
						block.css({ 
							"top" : (pos.top + b.getLabelHeight() + b.vOffset), 
							"left" : pos.left, 
							"width" : (b.getLabelWidth() - 7), 
							"position" : "absolute" });
						
						b.vOffset += 19;
						
						if (continueEvent) {
							block.prepend($('<span />').addClass("ui-icon").addClass("ui-icon-triangle-1-w"));
							
							var e = _eventObj['Event_' + ev.EventID + '_' + (b.weekNumber - 1)];
							if (e) { e.prepend($('<span />').addClass("ui-icon").addClass("ui-icon-triangle-1-e")); }
						}
						
						_eventObj[block.attr("id")] = block;
						
						b.events.push(ev);
					} else if (startBoxCompare == -1 && endBoxCompare >= 0) {
						var e = _eventObj['Event_' + ev.EventID + '_' + b.weekNumber];
						if (e) {
							var w = e.css("width")
							e.css({ "width" : (parseInt(w) + b.getLabelWidth() + 1) });
							b.vOffset += 19;
							b.events.push(ev);
						}
					}
					
					//end of month continue
					if (i == iend && endBoxCompare > 0) {
						var e = _eventObj['Event_' + ev.EventID + '_' + b.weekNumber];
						if (e) { e.prepend($('<span />').addClass("ui-icon").addClass("ui-icon-triangle-1-e")); }
					}
				}
			});
			
			for (var o in _eventObj) {
				_eventObj[o].hide();
				this.element.append(_eventObj[o]);
				_eventObj[o].show();
			}
		}
	},
	
	//This function will clean the JSON array, primaryly the dates and put the correct ones in the object.  Intended to alwasy be called on event functions.
	_filterEvents: function() {
		var cEvents = this.options.events;
		var self = this;
		
		if (cEvents && cEvents.length > 0) {
			var multi = [];
			var single = [];
			
			//Update and parse all the dates
			$.each(cEvents, function(){
				var ev = this;
				//Date Parse the JSON to create a new Date to work with here				
				if(ev.StartDateTime) {
					if (typeof ev.StartDateTime == 'object' && ev.StartDateTime.getDate) { this.StartDateTime = ev.StartDateTime; }
					if (typeof ev.StartDateTime == 'string' && ev.StartDateTime.split) { this.StartDateTime = self._getJSONDate(ev.StartDateTime); }
				} else if(ev.Date) { // DEPRECATED
					if (typeof ev.Date == 'object' && ev.Date.getDate) { this.StartDateTime = ev.Date; }
					if (typeof ev.Date == 'string' && ev.Date.split) { this.StartDateTime = _getJSONDate(ev.Date); }
				} else {
					return;  //no start date, or legacy date. no event.
				}
				
				if(ev.EndDateTime) {
					if (typeof ev.EndDateTime == 'object' && ev.EndDateTime.getDate) { this.EndDateTime = ev.EndDateTime; }
					if (typeof ev.EndDateTime == 'string' && ev.EndDateTime.split) { this.EndDateTime = self._getJSONDate(ev.EndDateTime); }
				} else {
					this.EndDateTime = this.StartDateTime.clone();
				}
				
				if (this.StartDateTime.clone().clearTime().compareTo(this.EndDateTime.clone().clearTime()) == 0) {
					single.push(this);
				} else if (this.StartDateTime.clone().clearTime().compareTo(this.EndDateTime.clone().clearTime()) == -1) {
					multi.push(this);
				}
			});
			
			multi.sort(self._eventSort);
			single.sort(self._eventSort);
			cEvents = [];
			$.merge(cEvents, multi);
			$.merge(cEvents, single);
		}
	},
	
	_eventSort: function(a, b) {
		return a.StartDateTime.compareTo(b.StartDateTime);
	},
	
	_getJSONDate: function(dateStr) {
		//check conditions for different types of accepted dates
		var tDt, k;
		if (typeof dateStr == "string") {
			
			//  "2008-12-28T00:00:00.0000000"
			var isoRegPlus = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2}).([0-9]{7})$/;
			
			//  "2008-12-28T00:00:00"
			var isoReg = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
		
			//"2008-12-28"
			var yyyyMMdd = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
			
			//  "new Date(2009, 1, 1)"
			//  "new Date(1230444000000)
			var newReg = /^new/;
			
			//  "\/Date(1234418400000-0600)\/"
			var stdReg = /^\\\/Date\(([0-9]{13})-([0-9]{4})\)\\\/$/;
			
			if (k = dateStr.match(isoRegPlus)) {
				return new Date(k[1],k[2]-1,k[3],k[4],k[5],k[6]);
			} else if (k = dateStr.match(isoReg)) {
				return new Date(k[1],k[2]-1,k[3],k[4],k[5],k[6]);
			} else if (k = dateStr.match(yyyyMMdd)) {
				return new Date(k[1],k[2]-1,k[3]);
			}
			
			if (k = dateStr.match(stdReg)) {
				return new Date(k[1]);
			}
			
			if (k = dateStr.match(newReg)) {
				return eval('(' + dateStr + ')');
			}
			
			return tDt;
		}
	},
	
	_buildEventBlock: function(ev, weekNumber) {
		var block = $('<div class="Event" id="Event_' + ev.EventID + '_' + weekNumber + '" eventid="' + ev.EventID +'"></div>');
		
		if(ev.CssClass) { block.addClass(ev.CssClass) }
		block.bind('click', null, this._trigger('onEventBlockClick', 0, [ev]));
		block.bind('mouseover', null, this._trigger('onEventBlockOver', 0, [ev]));
		block.bind('mouseout', null, this._trigger('onEventBlockOut', 0, [ev]));
		
		if (this.options.dragableEvents) {
			this._dragableEvent(ev, block, weekNumber);
		}
		
		var link;
		if (ev.URL && ev.URL.length > 0) {
			link = $('<a href="' + ev.URL + '">' + ev.Title + '</a>');
		} else {
			link = $('<a>' + ev.Title + '</a>');
		}
		
		link.bind('click', null, this._trigger('onEventLinkClick', 0, [ev]));
		block.append(link);
		return block;
	},

	_dragableEvent: function(event, block, weekNumber) {
		block.draggable({
			zIndex: 4,
			delay: 50,
			opacity: 0.5,
			revertDuration: 1000,
			cursorAt: { left: 5 },
			start: function(ev, ui) {
				//hide any additional event parts
				for (var i = 0; i <= _gridRows; i++) {
					if (i == weekNumber) {
						continue;
					}
					
					var e = _eventObj['Event_' + event.EventID + '_' + i];
					if (e) { e.hide(); }
				}
			}
		});
	},
	
	destroy: function() {
		
	},
	
	changeMonth: function(newDate) {
		if (false === this._trigger('beforeChangeMonth', 0, [newDate])) {
			return;
		}
		
		//update obj with new date and draw...
		
		this._trigger('afterChangeMonth', 0, [newDate])
	},
	
	//clears events in UI and event array.
	clear: function() {
		this.clearEvents();
		this.options.events = [];
	},
	
	addEvent: function(collection) {
		//add array or single
	},
	
	//just clears the boxes and event block (UI)
	clearEvents: function() {
		//removes all events
		$.each(this._cal.boxes, function() {
			this.clear();
		});
		
		$(".Event", this.element).remove();
		$(".MoreEvents", this.element).remove();
	}
	
});

$.extend($.ui.jmonthly, {
	version: "0.0.1",
	defaults: {
		events: [],
		headerHeight: 50,
		firstDayOfWeek: 0,
		startDate: new Date(),
		dragableEvents: false,
		dragHoverClass: 'DateBoxOver',
		
		todayLink: true,
		todayLinkText: 'Today',
		
		previousLink: true,
		previousLinkText: '&lsaquo; Prev',
		
		nextLink: true,
		nextLinkText: 'Next &rsaquo;',
		
		yearLinks: true,
		showMoreText: 'Show More'
	}
});


function CalendarMonth() {
	this.workingDate = Date.today().moveToFirstDayOfMonth();
	this.firstDayOfWeek = 0;
	this.daysInMonth = 0;
	this.firstOfMonth = null;
	this.lastOfMonth = null;
	this.gridOffset = 0;
	this.totalDates = 0;
	this.gridRows = 0;
	this.totalBoxes = 0;
	this.boxes = [];
	this.dateRange = {
		startDate: null,
		endDate: null
	};
	
	this.init = function(sDate, firstDayOfWeek) {
		// prime the object based on the date in
		if (sDate == undefined) {
			this.workingDate = Date.today().moveToFirstDayOfMonth();
		} else {
			this.workingDate = sDate.moveToFirstDayOfMonth();
		}
		if (firstDayOfWeek) {
			this.firstDayOfWeek = firstDayOfWeek;
		}
		this._load();
		return this;
	};
	
	this.update = function(newDate) {
		// update the object when changing months
		this.workingDate = newDate.moveToFirstDayOfMonth();
		this.boxes = [];
		this._load();
		return this;
	};
	
	this._load = function() {
		this.daysInMonth = this.workingDate.getDaysInMonth();
		this.firstOfMonth = this.workingDate.clone().moveToFirstDayOfMonth();
		this.lastOfMonth = this.workingDate.clone().moveToLastDayOfMonth();
		this.gridOffset = this.firstOfMonth.getDay() - this.firstDayOfWeek;
		this.totalDates = this.gridOffset + this.daysInMonth;
		this.gridRows = Math.ceil(this.totalDates / 7);
		this.totalBoxes = this.gridRows * 7;
		
		this.dateRange.startDate = this.firstOfMonth.clone().addDays((-1) * this.gridOffset);
		this.dateRange.endDate = this.lastOfMonth.clone().addDays(this.totalBoxes - (this.daysInMonth + this.gridOffset));
	};
};

function CalendarDateBox(id, boxDate, cell, label) {
	this.id = id;
	this.date = boxDate;
	this.cell = cell;
	this.label = label;
	this.weekNumber = Math.floor(id / 7);
	this.events= [];
	this.isTooManySet = false;
	this.vOffset = 0;
	
	this.echo = function() {
		$.log("Date: " + this.date + " WeekNumber: " + this.weekNumber + " ID: " + this.id);
	};
	
	this.clear = function() {
		this.events = [];
		this.isTooManySet = false;
		this.vOffset = 0;
	};
	
	this.getCellPosition = function() {
		if (this.cell) { 
			return this.cell.position();
		}
		return;
	};
	
	this.getCellBox = function() {
		if (this.cell) { 
			return this.cell;
		}
		return;
	};
	
	this.getLabelWidth = function() {
		if (this.label) {
			return this.label.innerWidth();
		}
		return;
	};
	
	this.getLabelHeight = function() {
		if (this.label) { 
			return this.label.height();
		}
		return;
	};
	
	this.getDate = function() {
		return this.date;
	};
};

})(jQuery);
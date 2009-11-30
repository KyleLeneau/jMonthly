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
		this._calendar = new CalendarMonth().init(this.options.startDate);
		$.log(this._calendar);
		
		
		this._drawCalendar(true);
	},
	
	_drawCalendar: function(init) {
		var o = this.options,
			c = this._calendar,
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
			
			//_boxes.push(new CalendarBox(i, currentDate, dateBox, dateLink));
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
			c = this._calendar,
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
	
	destroy: function() {
		
	},
	
	changeMonth: function(newDate) {
		if (false === this._trigger('beforeChangeMonth', 0, [newDate])) {
			return;
		}
		
		//update obj with new date and draw...
		
		this._trigger('afterChangeMonth', 0, [newDate])
	},
	
	addEvent: function(collection) {
		//add array or single
	},
	
	removeEvents: function() {
		//removes all events
	},
	
	replaceEvents: function(collection) {
		
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


})(jQuery);
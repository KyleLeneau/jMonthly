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

function CalendarMonth() {
	this._workingDate = Date.today().moveToFirstDayOfMonth();
	this._firstDayOfWeek = 0;
	this._daysInMonth = 0;
	this._firstOfMonth = null;
	this._lastOfMonth = null;
	this._gridOffset = 0;
	this._totalDates = 0;
	this._gridRows = 0;
	this._totalBoxes = 0;
	this._dateRange = {
		startDate: null,
		endDate: null
	};
	
	this._init = function(sDate, firstDayOfWeek) {
		// prime the object based on the date in
		if (sDate == undefined) {
			this._workingDate = Date.today().moveToFirstDayOfMonth();
		} else {
			this._workingDate = sDate.moveToFirstDayOfMonth();
		}
		if (firstDayOfWeek) {
			this._firstDayOfWeek = firstDayOfWeek;
		}
		this._load();
		return this;
	};
	
	this._update = function(newDate) {
		// update the object when changing months
		this._workingDate = newDate.moveToFirstDayOfMonth();
		this._load();
		return this;
	};
	
	this._load = function() {
		this._daysInMonth = this._workingDate.getDaysInMonth();
		this._firstOfMonth = this._workingDate.clone().moveToFirstDayOfMonth();
		this._lastOfMonth = this._workingDate.clone().moveToLastDayOfMonth();
		this._gridOffset = this._firstOfMonth.getDay() - this._firstDayOfWeek;
		this._totalDates = this._gridOffset + this._daysInMonth;
		this._gridRows = Math.ceil(this._totalDates / 7);
		this._totalBoxes = this._gridRows * 7;
		
		this._dateRange.startDate = this._firstOfMonth.clone().addDays((-1) * this._gridOffset);
		this._dateRange.endDate = this._lastOfMonth.clone().addDays(this._totalBoxes - (this._daysInMonth + this._gridOffset));
	};
};



$.widget("ui.jmonthly", {
	
	_init: function() {
		
		this.element.addClass("ui-widget ui-corner-all");

		// calendar object to track props.
		this._setCalendar(new CalendarMonth()._init(new Date()));
		
		console.log(this._getCalendar());
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
		
	},
	
	_setCalendar: function(calendar) {
		this._setData('calendar', calendar);
		//everytime we se the date call refresh to update state/html?
	},
	
	_getCalendar: function() {
		return this._getData('calendar');
	}
	
});

$.extend($.ui.jmonthly, {
	version: "0.0.1",
	defaults: {
		events: [],
		firstDayOfWeek: 0,
		startDate: new Date()
	}
});
	
})(jQuery);
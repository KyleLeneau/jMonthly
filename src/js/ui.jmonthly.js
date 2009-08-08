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
		
		this.element.addClass("ui-widget ui-corner-all");
		
	},
	
	destroy: function() {
		
	},
	
	changeMonth: function() {
		if (false === self._trigger('beforeChangeMonth', event)) {
			return;
		}
		
		
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
		firstDayOfWeek: 0,
		startDate: new Date()
	}
});
	
})(jQuery);
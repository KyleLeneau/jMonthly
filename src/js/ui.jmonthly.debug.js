/*!
* Title:  jMonthly @VERSION
* Dependencies:  jQuery 1.3.0
* Author:  Kyle LeNeau
* Email:  kyle.leneau@gmail.com
* Project Hompage:  http://www.bytecyclist.com/projects/jmonthcalendar
* Source:  http://github.com/KyleLeneau/jMonthly
*
*/
(function($) {

	$.fn.debug = function() {
		return this.each(function(){
			if(window.console) {
				console.debug(this);
			}
		});
	};

	$.fn.log = function(message) {
	    if (window.console) {
	        console.log(message);
	    } else {
	        alert(message);
	    }
	};
	
	$.log = function(message) {
		if(window.console) {
			console.log(message);
		} else {
			alert(message);
		}
	};

})(jQuery);
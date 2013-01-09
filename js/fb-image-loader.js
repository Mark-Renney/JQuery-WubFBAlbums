/**
*
* WubFBAlbum v1.0 - JQuery Plugin
* 
* License: http://www.opensource.org/licenses/mit-license.php
* (c) Mark Renney, www.wubbleyou.co.uk
* 17/10/2012
*
**/


(function( $ ){

  var settings;
  

  var methods = {
    allalbums : function( ) { 
	
		var htmlObj = this;
		
	    //can't proceed without this
		if(settings.pageName == '')
			return false;
			
			
		var fburl = "https://graph.facebook.com/"+settings.pageName+'/albums';
		
		
		$.ajax({
		
			type: 'GET',
			url: fburl,
			dataType: 'jsonp',
			async: settings.async,
			success: function(data) { 
		
			//Make sure we have valid data
			if(typeof data['data'] != 'undefined'){
		
				$.each(data["data"], function() {
				
					var albumSettings = settings;
					albumSettings.albumID = this['id'];
					
					var albumObj = $('<div></div>').addClass('newclass');
									
					if(displayAlbum(albumObj, albumSettings)){
									
						$(htmlObj).append(albumObj);
					}
				
				});
			
			}
			
		}});
		
		return this;
    },
    onealbum : function( ) {

		
		displayAlbum(this, settings);
		return this;
    }

  };
  

  function displayAlbum(htmlObj, albumSettings){
  

		//can't proceed without this
		if(albumSettings.albumID == '')
			return false;
	
		var fburl = "https://graph.facebook.com/"+albumSettings.albumID+"?fields=photos.limit(200),cover_photo,name";
		var outStr = '';
		var outStrCover = '';
		
		var success = true;
		
		$.ajax({
		
			type: 'GET',
			url: fburl,
			dataType: 'jsonp',
			async: albumSettings.async,
			success: function(data) { 

			var classname = '';
			
			//Grab a unique class name
			var classCounter = 1;
			while(classname == ''){
			
				if($('.'+albumSettings.classPreq+classCounter.toString()).length<1)
					classname = albumSettings.classPreq+classCounter.toString();
					
				classCounter++;	
			}
			
			//Make sure we have valid data
			if(typeof data['photos'] != 'undefined' && typeof data['photos']["data"] != 'undefined'){
			
				$.each(data['photos']["data"], function() {
				
					//Determine the vars we are going to replace
					var strVars = {
					
						caption : (this['name'] != undefined ? this['name'] : '' ),
						url : this['source'],
						classname : classname,
						albumcaption : (data['name'] != undefined ? data['name'] : '' ),
					}
					
					if(albumSettings.photowrapper != '' && strVars.url != undefined){
						
						//if we have located the cover photo use the cover wrapper
						var cover = (data['cover_photo'] != undefined 
										&& this['id'] != undefined 
										&& this['id'] == data['cover_photo'] ? true : false );
						
						
						//Replace our tokens with the strVars
						var tmpOutStr = (cover ? albumSettings.coverWrapper : albumSettings.photoWrapper).replace(/\%\(\w+\)/g, function(s, key) { 
						
																				s = s.replace('%(', '').replace(')', '');
																				//Make sure we prevent XSS - probably a better/faster way than this
																				return (strVars[s] != undefined ? $('<div />').text(strVars[s]).html() : s ); 	
																			});	
	
						if(cover){
						
							outStr = tmpOutStr + outStr;
						}
						else{
						
							outStr += tmpOutStr;
						}											
					}
					
				});
				
				//finally append our new html
				$.each(htmlObj, function() {
					
					$(this).html(outStr);
				});
				
				if($.isFunction( albumSettings.onAlbumComplete ))
					albumSettings.onAlbumComplete(htmlObj, classname);
					
				
					
				success = true;
				
			}
			
			success = false;
		}});
  
  
		return success;
  }

  
  $.fn.wubFBAlbums = function(method, options, inFinalFunc) {
    
	 // Create some defaults, extending them with any options that were provided
    settings = $.extend( {
      'albumID'  : '',
      'pageName' : '',
	  'coverWrapper' : '<div class = "albumholder"><div class = "albumimg">' //The wrapper for our album cover photo
						+'<a href = "%(url)" class = "%(classname)" title = "%(caption)"><img src = "%(url)" alt = "%(caption)" /></a></div>'
						+'<div class = "albumname">%(albumcaption)</div></div>',
	  'photoWrapper' : '<a href = "%(url)" class = "%(classname)" title = "%(caption)"></a>', //Wrapper for each photo
	  'classPreq' : 'wubFB', //The class name to precede each set of album photos
	  'async' : 'true' //When firing ajax requests whether to use async or not

    }, options);
 
	 // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 2 ));
    } 
	else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.wubFBAlbums' );
    }  
	

  };
})( jQuery );
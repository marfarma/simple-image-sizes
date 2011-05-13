// Functions for the regenerating of images
var regenerate = {
	post_types : '',
	thumbnails : '',
	list : '',
	cur : 0,
	percent : '' ,
	getThumbnails : function() {
		var self = this;
		var inputs = jQuery('input.thumbnails:checked');
		
		// Get the checked thumbnails inputs
		if (inputs.length != jQuery('input.thumbnails[type="checkbox"]').length) {
			inputs.each(function(i) {
				self.thumbnails += '&thumbnails[]=' + jQuery(this).val();
			});
		}	
	},
	getPostTypes : function() {
		var self = this;
	    var inputs = jQuery('input.post_types:checked');
	    
	    // Get the checked post Types inputs
		if (inputs.length != jQuery('input.post_types[type="checkbox"]').length) {
			inputs.each(function() {
				self.post_types += '&post_types[]=' + jQuery(this).val();
			});
		}
	},
	setMessage : function( msg ) {
		// Display the message
	    jQuery("#regenerate_message").html(msg).addClass('updated').addClass('fade').show();
		this.refreshProgressBar();
	},
	refreshProgressBar: function(){
		// Refresh the progress Bar
		jQuery(".progress").progressbar();
	},
	startRegenerating : function( ) {
		var self = this;
		
		// Start ajax
		jQuery.ajax({
			url: sis.ajaxUrl,
			type: "POST",
			data: "action=ajax_thumbnail_rebuild&do=getlist" + self.post_types,
			beforeSend: function(){
				
				// Disable the button
				jQuery("#ajax_thumbnail_rebuild").attr("disabled", true);
				
				// Display the message
				self.setMessage("<p>" + sis.reading + "</p>");
				
				// Get the humbnails and post types
				self.getThumbnails();
				self.getPostTypes();
			},
			success: function(r) {
				// Eval the response
				self.list = eval( r );
				
				// Set the current to 0
				self.curr = 0;
				
				// Display the progress Bar
				jQuery('.progress').show();
				
				// Start Regenerating
				self.regenItem();
			}
		});
	},
	regenItem : function( ) {
		var self = this;
		
		// If the list is empty display the message of emptyness and reinitialize the form
		if (!this.list) {
			this.reInit();
			this.setMessage(sis.noMedia);
			return false;
		}
		
		// If we have finished the regeneration display message and init again
		if (this.curr >= this.list.length) {
			this.reInit();
			this.setMessage( sis.done+this.curr+' '+sis.messageRegenerated);
			return;
		}
		
		// Set the message of current image regenerating
		this.setMessage(sis.regenerating + (this.curr + 1) + sis.of + this.list.length + " (" + this.list[this.curr].title + ")...");

		jQuery.ajax({
			url: sis.ajaxUrl,
			type: "POST",
			data: "action=ajax_thumbnail_rebuild&do=regen&id=" + this.list[this.curr].id + this.thumbnails,
			beforeSend : function() {
				// Calculate the percentage of regeneration
				self.percent = ( self.curr / self.list.length ) * 100;
				
				// Change the progression
				jQuery(".progress").progressbar("value", self.percent);
				
				// Change the text of progression
				jQuery(".progress-percent span.text").html(Math.round(self.percent) + "%").closest( '.progress-percent' ).animate( { left: Math.round( self.percent )-2.5 + "%" }, 500 );
			},
			success: function( r ) {
				// Eval the result
				r = eval( r );
				
				// Display the image
				jQuery("#thumb").show();
				
				// Change his attribute
				jQuery("#thumb-img").attr("src", r[0].src);
				
				// Inscrease the counter and regene the next item
				self.curr++;
				self.regenItem();
			}
		});
	},
	reInit: function() {
		// Re initilize the form
		jQuery("#ajax_thumbnail_rebuild").removeAttr("disabled");
		jQuery(".progress, #thumb").hide();
	}
}

var sizes = {
	i: 0,
	add: function(e,el) {
		e.preventDefault();
		
		// Create the template
		var elTr = jQuery( '<tr />' ).attr( 'valign', 'top' ).addClass( 'new_size_' + this.i );
		jQuery( '<th />' ).attr( 'scope', 'row' ).append( 
								jQuery( '<input />' )
									.attr( { 	
										type: 'text',
										id: 'new_size_'+this.i,
									}
								 )
								 .val( 'thumbnail-name' )
							).appendTo( elTr );
		
		jQuery( '<td />' ).append( jQuery( '<input />' )
									.attr( { 	
										type: 'button',
										id: 'validate_'+this.i,
									}
								 )
								 .val( sis.validate )
								 .addClass('button-secondary action add_size_name')
							).appendTo( elTr );
		
		// Add the form for editing
	    jQuery(el).closest( 'tr' ).before(elTr);
	    
	    // Inscrease the identifier
	    this.i++;
	},
	register: function( e, el ) {
		// Stop propagation
		e.preventDefault();
		
		// Get name and id
	    var name = jQuery(el).closest('tr').children('th').find('input').val();
	    var id = jQuery(el).closest('tr').children('th').find('input').attr('id');
		
		// Get the number of elements with this name
	    var checkPresent = jQuery( el ).closest('tbody').find( 'input[value="'+name+'"]' ).length;
		
		// Check if not basic size or already present, display message
		if( name == 'thumbnail' || name == "medium" || name == "large" ) {
			alert( sis.notOriginal );
			return false;
		} else if( checkPresent !=0 ) {
			alert( sis.alreadyPresent );
			return false;		
		}
		
		// Create td and th elements fo the row
		var thEl = jQuery( '<th />' ).attr( 'scope', 'row' ).text( sis.size + ' ' + name );
		var tdEl = jQuery( '<td />' );
		
		jQuery( '<input />' ).attr( { type: 'hidden', name: 'image_name' } ).val( name ).appendTo( tdEl ) ;
		jQuery( '<input />' ).attr( { type :'hidden', name : 'custom_image_sizes[' + name + '][custom]' } ).val( "1" ).appendTo( tdEl );
		
		jQuery( '<label />' ).attr( 'for', 'custom_image_sizes[' + name + '][w]' ).text(sis.maximumWidth).append( 
			jQuery( '<input />' ).attr( { 	type: 'number', 
											name: 'custom_image_sizes[' + name + '][w]',
											step: 1,
											min: 0,
											id: 'custom_image_sizes[' + name + '][w]'
										}
										).val( "0" ).addClass( "w" )
		).appendTo( tdEl );
		
		jQuery( '<label />' ).attr( 'for', 'custom_image_sizes[' + name + '][h]' ).text(sis.maximumHeight).append( 
			jQuery( '<input />' ).attr( { 	type: 'number', 
											name: 'custom_image_sizes[' + name + '][h]',
											step: 1,
											min: 0,
											id: 'custom_image_sizes[' + name + '][h]'
										}
										).val( "0" ).addClass( "h" )
		).appendTo( tdEl );
		
		jQuery( '<div />' )
			.addClass( 'crop' )
				.append( 
					jQuery( '<input />' )
						.attr( { 	
									type: 'checkbox', 
									name: 'custom_image_sizes[' + name + '][c]',
									id: 'custom_image_sizes[' + name + '][c]'
								} )
						.val( "1" )
						.addClass( 'c' )
				)
				.append(
					jQuery( '<label />' )
						.attr( { 	
									'for': 'checkbox', 
									id: 'custom_image_sizes[' + name + '][c]'
								} )
						.text( sis.crop ) 
				).appendTo( tdEl );
		
		jQuery( '<div />' ).text( sis.deleteImage ).addClass('delete_size').appendTo( tdEl );
		jQuery( '<div />' ).text( sis.validateButton ).addClass('add_size validate_size').appendTo( tdEl );
		
		// Add the row to the current list
		jQuery('#' + id).closest( 'tr' ).html( thEl.after( tdEl ) );
		
		// Refresh the buttons
		this.setButtons();
	},
	deleteSize: function( e, el ) {
		e.preventDefault();
		// Check if user want to delete or not
		var confirmation = confirm( sis.confirmDelete );
		
		// Delete if ok else not delete
		if( confirmation == true ) {
			// Remove from the list and the array
			jQuery( el ).closest( 'tr' ).remove();
			this.ajaxUnregister( el );
		}
	},
	getPhp : function( e, el ) {
		e.preventDefault();
		// Get parent element
		var parent = jQuery( el ).closest('tr');
		
	    jQuery.ajax({
	        url: sis.ajaxUrl,
	        type: "POST",
	        data: { action : "get_sizes" },
	        beforeSend: function() {
	        	// Remove classes of status
	        	parent.removeClass( 'addPending' );
	        	parent.addClass( 'addPending' );
	        },
	        success: function(result) {
	        	// Add the classes for the status
	            jQuery('#get_php').nextAll('code').html('<br />' + result).show().css( { 'display' : 'block' } );
	            parent.removeClass( 'addPending' );
	        }
	    });
	},
	ajaxRegister: function( e,el ) {
		e.preventDefault();
		
		// Get the vars
		var self = this;
		var timer;
		var parent = jQuery( el ).closest('tr');
		var n = parent.find('input[name=image_name]').val();
		var c = parent.find( 'input.c' ).attr( 'checked' );
		var w = parseInt( parent.find( 'input.w' ).val() );
		var h = parseInt( parent.find( 'input.h' ).val() );
		
		jQuery.ajax({
	        url: sis.ajaxUrl,
	        type: "POST",
	        data: { action : "add_size", width: w, height: h, crop: c, name: n },
	        beforeSend: function() {
	        	// Remove status and set pending
	        	parent.removeClass( 'errorAdding notChangedAdding successAdding' );
	        	parent.addClass( 'addPending' );
	        },
	        success: function(result) {
	        	// Set basic class and remove pending
	        	var classTr = '';
	        	parent.removeClass( 'addPending' );
	        	
	        	// Check the result for the different messages
	        	if( result == 0 ) {
	        		classTr = 'errorAdding';
	        	} else if( result == 2 ) {
	        		classTr = 'notChangedAdding';
	        		
	        		// add/update to the array with the status class
	        		self.addToArray( n,w,h,c,classTr );
	        	} else {
	        		classTr = 'successAdding';
	        		
	        		// add/update to the array with the status class
	        		self.addToArray( n,w,h,c,classTr );
	        	}
				
				// Add the generated class
	        	parent.addClass( classTr );
	        	
	        	// Change the button text
	        	parent.find( '.add_size .ui-button-text' ).text(sis.update) ;
	        	
	        	clearTimeout( timer );
	        	// Remove classes after 3 seconds
	        	timer = setTimeout(function() {
					parent.removeClass( 'errorAdding notChangedAdding successAdding' );
				}, 3 * 1000  );
			}
		});	
	},
	ajaxUnregister: function( el) {
		// Get name and self object
		var self = this;
		var n =  jQuery( el ).closest('tr').find('input[name=image_name]').val();
		
		// Make the ajax call
		jQuery.ajax({
	        url: sis.ajaxUrl,
	        type: "POST",
	        data: { action : "remove_size", name: n },
	        success: function(result) {
				self.removeFromArray( el );
	        }
	    });	
	},
	addToArray: function( n,w,h,c,s ) {
		// Get the row for editing or updating
		var testRow = jQuery( '#sis-regen .wrapper > table > tbody input[value="'+n+'"]' );
		var newRow = '';
		var timer;
		
		// Get the right newRow, updating or adding ?
		if( testRow.length != 0 )
			newRow = testRow.closest( 'tr' );
		else
			newRow = jQuery( '#sis-regen .wrapper > table > tbody > tr:first' ).clone();
		
		// Set the datas with the given datas
		newRow.find( 'td > label' ).attr( 'for', n )
		.end()
		.find( 'input.thumbnails' ).val( n ).attr( 'id', n ).end()
		.find( 'td:nth-child(2) > label' ).text( n )
		.end()
		.find( 'td:nth-child(3) > label' ).text( w+'px' )
		.end()
		.find( 'td:nth-child(4) > label' ).text( h+'px' )
		.end()
		.find( 'td:nth-child(5) > label' ).text( c );
		
		// If new then add the row
		if( testRow.length == 0 )
			newRow.appendTo( '#sis-regen .wrapper > table > tbody' );
		
		// Remove the previous status classes and add the status class
		newRow.removeClass( 'errorAdding notChangedAdding successAdding' ).addClass( s );
		
		clearTimeout( timer );
		// Remove the statuses classes
		timer = setTimeout(function() {
			newRow.removeClass( 'errorAdding notChangedAdding successAdding' );
		}, 3 * 1000 );
	},
	removeFromArray: function( el ) {
		// get the name
		var n = jQuery( el ).closest( 'tr' ).find( 'input[name=image_name]' ).val();
		
		// Remove the given name from the array
		jQuery( '#sis-regen .wrapper > table > tbody input[value="'+n+'"]' ).closest( 'tr' ).remove();
	},
	setButtons: function() {
	    // UI for delete,crop and add buttons
		jQuery(".delete_size").button({
			icons: {
				primary: 'ui-icon-circle-close'
			}
		});
		jQuery(".add_size").button({
			icons: {
				primary: 'ui-icon-circle-check'
			}
		});
		jQuery(".crop").button();
	}
}
jQuery(function() {
	
	// Regeneration listener
	jQuery( '#ajax_thumbnail_rebuild' ).click( function(){ regenerate.startRegenerating(); } );
	
	// Add size button listener
    jQuery('#add_size').click(function( e ){ sizes.add( e, this ); });
    
    // Registering a new size listener
    jQuery('.add_size_name').live( 'click',function( e ){ sizes.register( e, this ); });
    
    // Delete and Adding buttons
    jQuery('.delete_size').live('click', function( e ){ sizes.deleteSize( e, this ); });
    jQuery('.validate_size').live('click', function( e ){ sizes.ajaxRegister( e, this ); });
    
    // Seup the getphp
    jQuery('#get_php').click( function( e ){ sizes.getPhp( e, this ) } );
	jQuery('#get_php').nextAll('code').hide();
    
    // Colors for the theme / custom sizes
    jQuery('span.custom_size').closest('tr').children('th').css({
        'color': '#89D76A'
    });
    jQuery('span.theme_size').closest('tr').children('th').css({
        'color': '#F2A13A'
    });	
    
	// Set the buttons
	sizes.setButtons();

	// Error ajax handler
	jQuery( '<div class="ui-widget" id="msg"><div class="ui-state-error ui-corner-all" style="padding: 0 .7em;"><p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span><strong>Alert:</strong> <ul class="msg" ></ul></p></div></div>').prependTo( "div#wpwrap" ).slideUp( 0 );
	
	// Display the errors of ajax queries
	jQuery("#msg").ajaxError(function(event, request, settings) {
		jQuery(this).find( '.msg' ).append("<li>"+sis.ajaxErrorHandler+" " + settings.url + ", status "+request.status+" : "+request.statusText+"</li>").end().stop( false, false).slideDown( 200 ).delay( 5000 ).slideUp( 200 );
	});
});
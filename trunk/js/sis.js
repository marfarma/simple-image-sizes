var i = 0;
var regenerate = {
	post_types : '',
	thumbnails : '',
	list : '',
	cur : 0,
	percent : '' ,
	getThumbnails : function() {
		var self = this;
		var inputs = jQuery('input.thumbnails:checked');
		if (inputs.length != jQuery('input.thumbnails[type="checkbox"]').length) {
			inputs.each(function(i) {
				self.thumbnails += '&thumbnails[]=' + jQuery(this).val();
			});
		}	
	},
	getPostTypes : function() {
		var self = this;
	    var inputs = jQuery('input.post_types:checked');
		if (inputs.length != jQuery('input.post_types[type="checkbox"]').length) {
			inputs.each(function() {
				self.post_types += '&post_types[]=' + jQuery(this).val();
			});
		}
	},
	setMessage : function( msg ) {
	    jQuery("#regenerate_message").html(msg).addClass('updated').addClass('fade').show();
		this.refreshProgressBar();
	},
	refreshProgressBar: function(){
		jQuery(".progress").progressbar();
	},
	startRegenerating : function( ) {
		var self = this;
		
		jQuery.ajax({
			url: sis.ajaxUrl,
			type: "POST",
			data: "action=ajax_thumbnail_rebuild&do=getlist" + self.post_types,
			beforeSend: function(){
				
				// Disable the button
				jQuery("#ajax_thumbnail_rebuild").attr("disabled", true);
				self.setMessage("<p>" + sis.reading + "</p>");
		
				self.getThumbnails();
				self.getPostTypes();
			},
			success: function(r) {
				self.list = eval( r );
				self.curr = 0;
				jQuery('.progress').show();
				
				self.regenItem();
			}
		});
	},
	regenItem : function( ) {
		var self = this;
		
		if (!this.list) {
			this.reInit();
			this.setMessage(sis.noMedia);
			return false;
		}
		
		if (this.curr >= this.list.length) {
			this.reInit();
			this.setMessage( sis.done+this.curr+' images have been regenerated !');
			return;
		}
		
		this.setMessage(sis.regenerating + (this.curr + 1) + sis.of + this.list.length + " (" + this.list[this.curr].title + ")...");

		jQuery.ajax({
			url: sis.ajaxUrl,
			type: "POST",
			data: "action=ajax_thumbnail_rebuild&do=regen&id=" + this.list[this.curr].id + this.thumbnails,
			beforeSend : function() {		
				self.percent = ( self.curr / self.list.length ) * 100;
				jQuery(".progress").progressbar("value", self.percent);
				jQuery(".progress-percent").html(Math.round(self.percent) + "%").animate( { left: Math.round( self.percent )-2.5 + "%" }, 500 );
			},
			success: function( r ) {
				r = eval( r );
				jQuery("#thumb").show();
				jQuery("#thumb-img").attr("src", r[0].src);

				self.curr++;
				self.regenItem();
			}
		});
	},
	reInit: function() {
		jQuery("#ajax_thumbnail_rebuild").removeAttr("disabled");
		jQuery(".progress, #thumb").hide();
	}
}

var sizes = {
	i: 0,
	add: function(e,el) {
		e.preventDefault();
		
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
		
	    jQuery(el).closest( 'tr' ).before(elTr);
	    
	    this.i++;
	},
	register: function( e, el ) {
		e.preventDefault();
	    var name = jQuery(el).closest('tr').children('th').find('input').val();
	    var id = jQuery(el).closest('tr').children('th').find('input').attr('id');

	    var checkPresent = jQuery( el ).closest('tbody').find( 'input[value="'+name+'"]' ).length;
		
		if( name == 'thumbnail' || name == "medium" || name == "large" ) {
			alert( sis.notOriginal );
			return false;
		} else if( checkPresent !=0 ) {
			alert( 'This size is already registered, edit it instead of recreating it.' );
			return false;		
		}
		
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
		jQuery( '<div />' ).text( 'Validate' ).addClass('add_size validate_size').appendTo( tdEl );

	    jQuery('#' + id).closest( 'tr' ).html( thEl.after( tdEl ) );
		this.setButtons();
	},
	delete: function( el ) {
		var confirmation = confirm( 'Do you really want to delete these size ?' );
		
		if( confirmation == true ) {
			jQuery( el ).closest( 'tr' ).remove();
			this.removeFromArray( el );
		}else{
			return false;
		}
	},
	getPhp : function( e, el ) {
		e.preventDefault();
		var parent = jQuery( el ).closest('tr');
	    jQuery.ajax({
	        url: sis.ajaxUrl,
	        type: "POST",
	        data: { action : "get_sizes" },
	        beforeSend: function() {
	        	parent.removeClass( 'addPending' );
	        	parent.addClass( 'addPending' );
	        },
	        success: function(result) {
	            jQuery('#get_php').nextAll('code').html('<br />' + result).show().css( { 'display' : 'block' } );
	            parent.removeClass( 'addPending' );
	        }
	    });
	},
	ajaxRegister: function( e,el ) {
		e.preventDefault();
		var self = this;
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
	        	parent.removeClass( 'errorAdding notChangedAdding successAdding' );
	        	parent.addClass( 'addPending' );
	        },
	        success: function(result) {
	        	
	        	var classTr = '';
	        	parent.removeClass( 'addPending' );
	        	
	        	if( result == 0 ) {
	        		classTr = 'errorAdding';
	        	} else if( result == 2 ) {
	        		classTr = 'notChangedAdding';
	        		self.addToArray( n,w,h,c,classTr );
	        	} else {
	        		classTr = 'successAdding';
	        		self.addToArray( n,w,h,c,classTr );
	        	}

	        	parent.addClass( classTr );
	        	parent.find( '.add_size .ui-button-text' ).text('Update') ;
	        	
	        	setTimeout(function() {
					parent.removeClass( 'errorAdding notChangedAdding successAdding' );
				}, 3 * 1000  );
			}
		});	
	},
	ajaxUnregister: function(e, el) {
		e.preventDefault();
		var self = this;
		var n =  jQuery( el ).closest('tr').find('input[name=image_name]').val();
		
		jQuery.ajax({
	        url: sis.ajaxUrl,
	        type: "POST",
	        data: { action : "remove_size", name: n },
	        beforeSend: function() {
	        },
	        success: function(result) {
				self.delete( el );	
	        }
	    });	
	},
	addToArray: function( n,w,h,c,s ) {
		var testRow = jQuery( '#sis-regen .wrapper > table > tbody input[value="'+n+'"]' );
		var newRow = '';
		
		if( testRow.length != 0 )
			newRow = testRow.closest( 'tr' );
		else
			newRow = jQuery( '#sis-regen .wrapper > table > tbody > tr:first' ).clone();
		
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
		
		if( testRow.length == 0 )
			newRow.appendTo( '#sis-regen .wrapper > table > tbody' );
		
		newRow.removeClass( 'errorAdding notChangedAdding successAdding' ).addClass( s );
		
		setTimeout(function() {
			newRow.removeClass( 'errorAdding notChangedAdding successAdding' );
		}, 3 * 1000 );
	},
	removeFromArray: function( el ) {
		var n = jQuery( el ).closest( 'tr' ).find( 'input[name=image_name]' ).val();
		jQuery( '#sis-regen .wrapper > table > tbody input[value="'+n+'"]' ).closest( 'tr' ).addClass( 'noTr' ).remove();
	},
	setButtons: function() {
	    // UI
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

	jQuery( '#ajax_thumbnail_rebuild' ).click( function(){ regenerate.startRegenerating(); } );	
    jQuery('#add_size').click(function( e ){ sizes.add( e, this ); });
    
    jQuery('.add_size_name').live( 'click',function( e ){ sizes.register( e, this ); });
    
    
    jQuery('.delete_size').live('click', function( e ){ sizes.ajaxUnregister( e, this ); });
    jQuery('.validate_size').live('click', function( e ){ sizes.ajaxRegister( e, this ); });
    
    
    jQuery('#get_php').click( function( e ){ sizes.getPhp( e, this ) } );
    
    jQuery('span.custom_size').closest('tr').children('th').css({
        'color': '#89D76A'
    });
    jQuery('span.theme_size').closest('tr').children('th').css({
        'color': '#F2A13A'
    });
    
	jQuery('.progress').hide();
	
	sizes.setButtons();
	
	jQuery('#get_php').nextAll('code').hide();
	
	jQuery( '<div class="ui-widget" id="msg"><div class="ui-state-error ui-corner-all" style="padding: 0 .7em;"><p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span><strong>Alert:</strong> <ul class="msg" ></ul></p></div></div>').prependTo( "div#wpwrap" ).slideUp( 0 );
	
	jQuery("#msg").ajaxError(function(event, request, settings) {
		jQuery(this).find( '.msg' ).append("<li>Error requesting page " + settings.url + ", status "+request.status+" : "+request.statusText+"</li>").end().stop( false, false).slideDown( 200 ).delay( 5000 ).slideUp( 200 );
	});
});
var i = 0 ;
jQuery(function() {
	jQuery( '#add_size' ).click( addSize );
	jQuery( '.add_size_name' ).live( 'click', registerSize );
	jQuery( '.delete_size' ).live( 'click', deleteSize );
	jQuery( 'span.custom_size' ).parent().parent().children('th').css( { 'color' : 'green' } );
	jQuery( 'span.theme_size' ).parent().parent().children('th').css( { 'color' : 'orange' } );
});

function addSize() {
	row = '<tr valign="top" class="new_size_'+i+'">';
		row += '<th scope="row">';
			row += '<input type="text" value="thumbnail-name" id="new_size_'+i+'" />';
		row += '</th>';
		row += '<td>';
			row += '<input type="button" class="button-secondary action add_size_name" id="validate_'+i+'" value="'+custom_image_size.validate+'" />';
		row += '</td>';
	row += '</tr>';

	jQuery( this ).parent().parent().before( row );
	i++;
}

function registerSize() {
	name = jQuery( this ).parent().parent().children( 'th' ).find( 'input' ).val();
	id = jQuery( this ).parent().parent().children( 'th' ).find( 'input' ).attr( 'id' );
	
	output = '<th scope="row">';
		output += 'Size '+name;
	output += '</th>';
	output += '<td>';
		output += '<input name="custom_image_sizes['+name+'][custom]" type="hidden" id="custom_image_sizes['+name+'][custom]" value="1" />';
		output +='<label for="custom_image_sizes['+name+'][w]">';
			output += custom_image_size.maximumWidth+' <input name="custom_image_sizes['+name+'][w] " type="text" id="custom_image_sizes['+name+'][w]" value="" class="small-text" />'
		output +='</label>';
			
		output +='<label for="custom_image_sizes['+name+'][h]">';
			output += custom_image_size.maximumHeight+' <input name="custom_image_sizes['+name+'][h]" type="text" id="custom_image_sizes['+name+'][h]" value="" class="small-text" />';
		output +='</label>';
		
		output +='<label class="crop"> '
		output +=custom_image_size.crop+' <input type="checkbox" name="custom_image_sizes['+name+'][c]" value="1" /> </label>';
		
		output +='<label class="ui-state-default ui-corner-all delete_size" style="width: 90px; padding: 0px; display:inline-block; position:relative; text-indent:16px;text-align:center">';
			output +=custom_image_size.deleteImage;
			output +='<div class="ui-icon ui-icon-circle-close" style="float: right; top: 2px; position:absolute;left: 0px;">';
			output +='</div>';
		output +='</label>';
	output += '</td>';	
	
	jQuery( '#'+id ).parent().parent().html( output );

}

function deleteSize() {
	jQuery( this ).parent().parent().remove();
}

////////////// Image resizing /////////////

function setMessage( msg ) {
	jQuery( "#regenerate_message" ).html( msg ).addClass( 'updated' ).addClass( 'fade' ).show();
	jQuery( ".progress" ).progressbar();
}

function regenerate() {
	jQuery( "#ajax_thumbnail_rebuild" ).attr( "disabled", true );
	setMessage( "<p>"+custom_image_size.reading+"</p>" );

	inputs = jQuery( 'input.thumbnails:checked' );
	var thumbnails= '';
	if( inputs.length != jQuery( 'input.thumbnails[type=checkbox]' ).length ) {
		inputs.each( function() {
			thumbnails += '&thumbnails[]='+jQuery( this ).val();
		} );
	}
	
	inputs = jQuery( 'input.post_types:checked' );
	var post_types= '';
	if( inputs.length != jQuery( 'input.post_types[type=checkbox]' ).length ) {
		inputs.each( function() {
			post_types += '&post_types[]='+jQuery( this ).val();
		} );
	}
	
	jQuery.ajax({
		url: custom_image_size.ajaxUrl, 
		type: "POST",
		data: "action=ajax_thumbnail_rebuild&do=getlist"+post_types,
		success: function( result ) {
			var list = eval( result );
			var curr = 0;
			
			function regenItem() {
				if( !list ) {
					jQuery( "#ajax_thumbnail_rebuild" ).removeAttr( "disabled" );
					jQuery( ".progress, #thumb" ).hide();
					
					setMessage( custom_image_size.noMedia );
					return false;
				}
				percent = ( curr / list.length ) * 100;
				jQuery(".progress").progressbar( "value", percent );
				jQuery(".progress-percent").html( Math.round( percent ) + "%" );
				if (curr >= list.length) {
					jQuery( "#ajax_thumbnail_rebuild" ).removeAttr( "disabled" );
					jQuery( ".progress, #thumb" ).hide();
					
					setMessage("Done.");
					return;
				}
				setMessage( custom_image_size.regenerating + ( curr+1 ) + " of " + list.length + " (" + list[curr].title + ")...");

				jQuery.ajax({
					url: custom_image_size.ajaxUrl,
					type: "POST",
					data: "action=ajax_thumbnail_rebuild&do=regen&id=" + list[curr].id + thumbnails,
					success: function( result ) {
						jQuery( "#thumb" ).show();
						jQuery( "#thumb-img" ).attr( "src",result );

						curr = curr + 1;
						regenItem();
					}
				});
			}

			regenItem();
		},
		error: function( request, status, error ) {
			setMessage( "Error " + request.status );
		}
	});
}

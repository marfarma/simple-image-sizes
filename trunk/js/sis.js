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
jQuery(function() {

	jQuery( '#ajax_thumbnail_rebuild' ).click( regen );
    jQuery('#add_size').click(addSize);
    jQuery('.add_size_name').live('click', registerSize);
    jQuery('.delete_size').live('click', deleteSize);
    jQuery('span.custom_size').closest('tr').children('th').css({
        'color': 'green'
    });
    jQuery('span.theme_size').closest('tr').children('th').css({
        'color': 'orange'
    });
	
    jQuery('#get_php').click(getPhp);
	jQuery('#get_php').nextAll('code').hide();
	
	jQuery('.progress').hide();
	
	jQuery( '<div class="ui-widget" id="msg"><div class="ui-state-error ui-corner-all" style="padding: 0 .7em;"><p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span><strong>Alert:</strong> <ul class="msg" ></ul></p></div></div>').prependTo( "div#wpwrap" ).slideUp( 0 );
	
	jQuery("#msg").ajaxError(function(event, request, settings) {
		jQuery(this).find( '.msg' ).append("<li>Error requesting page " + settings.url + ", status "+request.status+" : "+request.statusText+"</li>").end().slideDown( 200 ).delay( 5000 ).slideUp( 200 );
	});
});

function regen(){
	regenerate.startRegenerating();
}

function addSize(e) {
	e.preventDefault();
    row = '<tr valign="top" class="new_size_' + i + '">';
    row += '<th scope="row">';
    row += '<input type="text" value="thumbnail-name" id="new_size_' + i + '" />';
    row += '</th>';
    row += '<td>';
    row += '<input type="button" class="button-secondary action add_size_name" id="validate_' + i + '" value="' + sis.validate + '" />';
    row += '</td>';
    row += '</tr>';

    jQuery(this).closest( 'tr' ).before(row);
    i++;
}

function getPhp(e) {
	e.preventDefault();
    jQuery.ajax({
        url: sis.ajaxUrl,
        type: "POST",
        data: { action : "get_sizes" },
        success: function(result) {
            jQuery('#get_php').nextAll('code').html('<br />' + result).show().css( { 'display' : 'block' } );
        }
    });
}

function registerSize(e) {
	e.preventDefault();
    name = jQuery(this).closest('tr').children('th').find('input').val();
    id = jQuery(this).closest('tr').children('th').find('input').attr('id');
	
	if( name == 'thumbnail' || name == "medium" || name == "large" ) {
		alert( sis.notOriginal );
		return false;
	}
	
    output = '<th scope="row">';
    output += sis.size + ' ' + name;
    output += '</th>';
    output += '<td>';
    output += '<input name="custom_image_sizes[' + name + '][custom]" type="hidden" id="custom_image_sizes[' + name + '][custom]" value="1" />';
    output += '<label for="custom_image_sizes[' + name + '][w]">';
    output += sis.maximumWidth + ' <input name="custom_image_sizes[' + name + '][w] " type="text" id="custom_image_sizes[' + name + '][w]" value="" class="small-text" />'
    output += '</label>';

    output += '<label for="custom_image_sizes[' + name + '][h]">';
    output += sis.maximumHeight + ' <input name="custom_image_sizes[' + name + '][h]" type="text" id="custom_image_sizes[' + name + '][h]" value="" class="small-text" />';
    output += '</label>';

    output += '<label class="crop"> '
    output += sis.crop + ' <input type="checkbox" name="custom_image_sizes[' + name + '][c]" value="1" /> </label>';

    output += '<label class="ui-state-default ui-corner-all delete_size" style="width: 90px; padding: 0px; display:inline-block; position:relative; text-indent:16px;text-align:center">';
    output += sis.deleteImage;
    output += '<div class="ui-icon ui-icon-circle-close" style="float: right; top: 2px; position:absolute;left: 0px;">';
    output += '</div>';
    output += '</label>';
    output += '</td>';

    jQuery('#' + id).closest( 'tr' ).html(output);

}

function deleteSize() {
    jQuery(this).closest( 'tr' ).remove();
}
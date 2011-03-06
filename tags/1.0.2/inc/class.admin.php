<?php
Class SISAdmin{
	
	// Original sizes
	var $original = array( 'thumbnail', 'medium', 'large' );

	function __construct(){
		// Init
		add_action ( 'admin_menu', array( &$this, 'init' ) );
		add_action ( 'admin_init', array( &$this, 'registerJavaScript' ), 11 );
		
		// Add ajax action
		add_action('wp_ajax_ajax_thumbnail_rebuild', array( &$this, 'ajax_thumbnail_rebuild_ajax' ) );
	}
	
	/**
	 * Register javascripts and css.
	 * 
	 * @access public
	 * @return void
	 * @author Nicolas Juen
	 */
	function registerJavaScript() {
		// Add javascript
		wp_enqueue_script( 'custom_image_size', SIS_URL.'js/custom_sizes.min.js', array('jquery'), '1.0' );
		wp_enqueue_script( 'jquery-ui-progressbar', SIS_URL.'js/jquery-ui-1.8.10.custom.min.js', array(), '1.8.10' );
		
		// Ad javascript translation
		wp_localize_script( 'custom_image_size', 'custom_image_size', $this->localize_vars() );
		
		// Add CSS
		wp_enqueue_style( 'jquery-ui-regenthumbs', SIS_URL.'jquery-ui/redmond/jquery-ui-1.8.10.custom.css', array(), '1.8.10' );
	}
	
	/**
	 * Localize the var for javascript
	 * 
	 * @access public
	 * @return void
	 * @author Nicolas Juen
	 */
	function localize_vars() {
	    return array(
	        'ajaxUrl' =>  home_url( '/wp-admin/admin-ajax.php' ),
	        'reading' => __( 'Reading attachments...', 'sis' ),
	        'maximumWidth' => __( 'Maximum width', 'sis' ),
	        'maximumHeight' => __( 'Maximum height', 'sis' ),
	        'crop' => __( 'Crop ?', 'sis' ),
	        'deleteImage' => __( 'Delete', 'sis' ),
	        'noMedia' => __( 'No media in your site to regenerate !', 'sis' ),
	        'regenerating' => __( 'Regenerating ', 'sis'),
	        'validate' => __( 'Validate image size name', 'sis' ),	        
	    );
	}

	/**
	 * Init for the option page
	 * 
	 * @access public
	 * @return void
	 * @author Nicolas Juen
	 */
	function init() {
		
		// Check if admin
		if( !is_admin() )
			return false;
		
		// Get the image sizes
		global $_wp_additional_image_sizes;
		
		// Get the sizes and add the settings
		foreach ( get_intermediate_image_sizes() as $s ) {
		
			// Don't make the original sizes
			if( in_array( $s, $this->original ) )
				continue;
			
			// Set width
			if ( isset( $_wp_additional_image_sizes[$s]['width'] ) ) // For theme-added sizes
				$width = intval( $_wp_additional_image_sizes[$s]['width'] );
			else                                                     // For default sizes set in options
				$width = get_option( "{$s}_size_w" );
			
			// Set height
			if ( isset( $_wp_additional_image_sizes[$s]['height'] ) ) // For theme-added sizes
				$height = intval( $_wp_additional_image_sizes[$s]['height'] );
			else                                                      // For default sizes set in options
				$height = get_option( "{$s}_size_h" );
			
			//Set crop
			if ( isset( $_wp_additional_image_sizes[$s]['crop'] ) )   // For theme-added sizes
				$crop = intval( $_wp_additional_image_sizes[$s]['crop'] );
			else                                                      // For default sizes set in options
				$crop = get_option( "{$s}_crop" );
			
			// Add the setting ield for this size
			add_settings_field( 'image_size_'.$s.'', __( 'Size ', 'sis' ).$s, array( &$this, 'image_sizes' ), 'media' , 'default', array( 'name' => $s , 'width' => $width , 'height' => $height ) );

	 	}
	 	
	 	// Register the setting for media option page
	 	register_setting( 'media', 'custom_image_sizes' );
	 	
	 	// Add the button
	 	add_settings_field( 'add_size', 'Add a new size', array( &$this, 'add_size' ), 'media' );
	 	
	 	// Add section for the thumbnail regeneration
	 	add_settings_section( 'thumbnail_regenerate', __( 'Thumbnail regeneration', 'sis' ), array( &$this, 'thumbnail_regenerate' ), 'media' );
 	}
 	
 	/**
 	 * Display the row of the image size
 	 * 
 	 * @access public
 	 * @param mixed $args
 	 * @return void
	 * @author Nicolas Juen
 	 */
 	function image_sizes( $args ) {
 		// Get the options
		$sizes = (array)get_option( 'custom_image_sizes' );
		
		$height 	= 	isset( $sizes[$args['name']]['h'] )? $sizes[$args['name']]['h'] : $args['height'] ;
		$width 		= 	isset( $sizes[$args['name']]['w'] )? $sizes[$args['name']]['w'] : $args['width'] ;
		$crop 		= 	isset( $sizes[$args['name']]['c'] ) && !empty( $sizes[$args['name']]['c'] )? '1' : '0' ;
		$custom 	= 	( isset( $sizes[$args['name']]['custom'] ) && !empty( $sizes[$args['name']]['custom'] ) )? '1' : '0' ;
		?>
		<?php if( $custom ): ?>
			<span class="custom_size"> <?php _e( 'Custom size', 'sis'); ?> : </span>
			<input name="<?php echo 'custom_image_sizes['.$args['name'].'][custom]' ?>" type="hidden" id="<?php echo 'custom_image_sizes['.$args['name'].'][custom]' ?>" value="1" />
		<?php else: ?>
			<span class="theme_size"> <?php _e( 'Theme size', 'sis'); ?> : </span>
			<input name="<?php echo 'custom_image_sizes['.$args['name'].'][theme]' ?>" type="hidden" id="<?php echo 'custom_image_sizes['.$args['name'].'][theme]' ?>" value="1" />
		<?php endif; ?>
		<label for="<?php echo 'custom_image_sizes['.$args['name'].'][w]' ?>">
			<?php _e( 'Maximum width', 'sis'); ?> 
			<input name="<?php echo 'custom_image_sizes['.$args['name'].'][w]' ?>" type="text" id="<?php echo 'custom_image_sizes['.$args['name'].'][w]' ?>" value="<?php echo $width  ?>" class="small-text" />
		</label>
			
		<label for="<?php echo 'custom_image_sizes['.$args['name'].'][h]' ?>">
			<?php _e( 'Maximum height', 'sis'); ?> 
			<input name="<?php echo 'custom_image_sizes['.$args['name'].'][h]' ?>" type="text" id="<?php echo 'custom_image_sizes['.$args['name'].'][h]' ?>" value="<?php echo $height ?>" class="small-text" />
		</label>
	
		
		<label class="crop">
			<?php _e( 'Crop ?', 'sis'); ?> 
			<input type='checkbox' <?php checked( $crop, 1 ) ?> name="<?php echo 'custom_image_sizes['.$args['name'].'][c]' ?>" value="1" />
		</label>
		<!-- <img src="<?php echo esc_url( admin_url( 'images/no.png' ) ); ?>" alt="" class="delete_size" /> -->
		<label class="ui-state-default ui-corner-all delete_size" style="width: 90px; padding: 0px; display:inline-block; position:relative; text-indent:16px;margin-right:5px;text-align:center">
			<?php _e( 'Delete', 'sis'); ?> 
			<div class="ui-icon ui-icon-circle-close" style="float: right; top: 2px; position:absolute;left: 0px;">
			</div>
		</label>
	<?php }
	
	/**
	 * Add the button to ass a size
	 * 
	 * @access public
	 * @return void
 	 * @author Nicolas Juen
	 */
	function add_size() { ?>
		<input type="button" class="button-secondary action" id="add_size" value="<?php _e( 'Add a new size of thumbnail', 'sis'); ?> " />
	<?php
	}
	
	/**
	 * Display the Table of sizes and post types for regenerating
	 * 
	 * @access public
	 * @return void
	 * @author Nicolas Juen
	 */
	function thumbnail_regenerate() {
		// Get the sizes
		global $_wp_additional_image_sizes;
?>
		<div>
			<div style="display: inline-block;float: left;width: 45%;">
			    <h4> <?php _e( 'Select which thumbnails you want to rebuild:', 'sis'); ?> </h4>
				<table cellspacing="0" class="widefat page fixed">
	                <thead>
	                    <tr>
	                    	<th class="manage-column column-comments" scope="col"><?php _e( 'Resize ?', 'sis'); ?></th>
	                        <th class="manage-column column-author" scope="col"><?php _e( 'Size name', 'sis'); ?></th>
	                        <th class="manage-column column-author" scope="col"><?php _e( 'Width', 'sis'); ?></th>
	                        <th class="manage-column column-author" scope="col"><?php _e( 'Height', 'sis'); ?></th>
	                        <th class="manage-column column-author" scope="col"><?php _e( 'Crop ?', 'sis'); ?></th>
	                    </tr>
	                </thead>
	                <tboby>
	            		<?php
	            		// Display the sizes in the array
	            		foreach ( get_intermediate_image_sizes() as $s ):
	
							if ( isset( $_wp_additional_image_sizes[$s]['width'] ) ) // For theme-added sizes
								$width = intval( $_wp_additional_image_sizes[$s]['width'] );
							else                                                     // For default sizes set in options
								$width = get_option( "{$s}_size_w" );
			
							if ( isset( $_wp_additional_image_sizes[$s]['height'] ) ) // For theme-added sizes
								$height = intval( $_wp_additional_image_sizes[$s]['height'] );
							else                                                      // For default sizes set in options
								$height = get_option( "{$s}_size_h" );
			
							if ( isset( $_wp_additional_image_sizes[$s]['crop'] ) )   // For theme-added sizes
								$crop = intval( $_wp_additional_image_sizes[$s]['crop'] );
							else                                                      // For default sizes set in options
								$crop = get_option( "{$s}_crop" );
							?>
							<tr>
								<td>
	                				<input type="checkbox" class="thumbnails" id="<?php echo $s ?>" name="thumbnails[]" checked="checked" value="<?php echo $s ?>" />
	                			</td>
	                			
								<td>
									<label for="<?php echo $s ?>">
										<?php echo $s; ?>
									</label>
								</td>
								
								<td>
									<label for="<?php echo $s ?>">
										<?php echo $width;?> px
									</label>
								</td>
								
								<td>
									<label for="<?php echo $s ?>">
										<?php echo $height; ?> px
									</label>
								</td>
								
								<td>
									<label for="<?php echo $s ?>">
										<?php echo ( $crop == 1 )? 'yes':'no'; ?>
									</label>
								</td>
							</tr>
						<?php endforeach;?>
	                </tbody>                
	                <tfoot>
	                    	<th class="manage-column column-comments" scope="col"><?php _e( 'Resize ?', 'sis'); ?></th>
	                        <th class="manage-column column-author" scope="col"><?php _e( 'Size name', 'sis'); ?></th>
	                        <th class="manage-column column-author" scope="col"><?php _e( 'Width', 'sis'); ?></th>
	                        <th class="manage-column column-author" scope="col"><?php _e( 'Height', 'sis'); ?></th>
	                        <th class="manage-column column-author" scope="col"><?php _e( 'Crop ?', 'sis'); ?></th>
	                </tfoot>
	            </table>
			</div>
			<div style="display: inline-block;width: 25%;margin-left: 15px;">
				<h4><?php _e( 'Select which post type source thumbnails you want to rebuild:', 'sis'); ?></h4>
				<table cellspacing="0" class="widefat page fixed">
	                <thead>
	                    <tr>
	                    	<th class="manage-column column-comments" scope="col"><?php _e( 'Resize ?', 'sis'); ?></th>
	                    	<th class="manage-column column-author" scope="col"><?php _e( 'Post type', 'sis'); ?></th>
	                    </tr>
	                </thead>
	                <tboby>
						<?php
						// Diplay the post types table
						foreach ( get_post_types( array( 'public' => true ), 'objects' ) as $ptype ):
							?>
							<tr>
								<td>
									<label for="<?php echo $ptype->name; ?>">
										<input type="checkbox" class="post_types" name="post_types[]" checked="checked" id="<?php echo $ptype->name; ?>" value="<?php echo $ptype->name; ?>" />
									</label>
								</td>
								<td>
								<label for="<?php echo $ptype->name; ?>">
									<em><?php echo $ptype->labels->name; ?></em>
								</label>
								</td>
							</tr>
						<?php endforeach;?>
					</tbody>                
	                <tfoot>
	                    <tr>
	                    	<th class="manage-column column-comments" scope="col"><?php _e( 'Resize ?', 'sis'); ?></th>
	                    	<th class="manage-column column-author" scope="col"><?php _e( 'Post type', 'sis'); ?></th>
	                    </tr>
	                </tfoot>
				</table>
			</div>
		</div>
		
		<div style="clear:both;padding-top:15px">
			<div id="regenerate_message" style="display:none"></div>
			<div class="progress" style="position:relative;height:25px;">
				<div class="progress-percent" style="position:absolute;left:50%;top:50%;width:50px;margin-left:-25px;height:25px;margin-top:-9px;font-weight:bold;text-align:center;"></div>
			</div>
			<div id="thumb" style="display:none;"><h4><?php _e( 'Last image:', 'sis'); ?></h4><img id="thumb-img" /></div>
			<input type="button" onClick="javascript:regenerate();" class="button" name="ajax_thumbnail_rebuild" id="ajax_thumbnail_rebuild" value="<?php _e( 'Regenerate Thumbnails', 'sis' ) ?>" style="margin-top:40px;" />
		</div>
		<?php
	}
	
	/**
	 * Rebuild the image
	 * 
	 * @access public
	 * @return void
	 * @author Nicolas Juen
	 */
	function ajax_thumbnail_rebuild_ajax() {
		global $wpdb;
		
		// Get the action
		$action = $_POST["do"];
		
		// Get the thumbnails
		$thumbnails = isset( $_POST['thumbnails'] )? $_POST['thumbnails'] : NULL;
		
		if ( $action == "getlist" ) {
			if ( isset( $_POST['post_types'] ) && !empty( $_POST['post_types'] ) ) {
				
				// Get image medias
				$whichmimetype = wp_post_mime_type_where( 'image', $wpdb->posts );
				
				// Get all parent from post type
				$attachments = $wpdb->get_results( "SELECT *
					FROM $wpdb->posts 
					WHERE 1 = 1
					AND post_type = 'attachment'
					$whichmimetype
					AND post_parent IN (
						SELECT DISTINCT ID 
						FROM $wpdb->posts 
						WHERE post_type IN ('".implode( "', '", $_POST['post_types'] )."')
					)" );
					
			} else {
				$attachments =& get_children( array(
					'post_type' => 'attachment',
					'post_mime_type' => 'image',
					'numberposts' => -1,
					'post_status' => null,
					'post_parent' => null, // any parent
					'output' => 'object',
				) );
			}
			
			// Get the attachments
			foreach ( $attachments as $attachment ) {
				$res[] = array('id' => $attachment->ID, 'title' => $attachment->post_title);
			}
			// Return the Id's and Title of medias
			die( json_encode( $res ) );
		} else if ( $action == "regen" ) {
			// Get the id
			$id = $_POST["id"];
			
			// Check Id
			if( (int)$id == 0 ) {
				die( Null );
			}
			
			// Get the path
			$fullsizepath = get_attached_file( $id );
			
			// Regen the attachment
			if ( FALSE !== $fullsizepath && @file_exists( $fullsizepath ) ) {
				set_time_limit( 30 );
				wp_update_attachment_metadata( $id, $this->wp_generate_attachment_metadata_custom( $id, $fullsizepath, $thumbnails ) );
			}
			
			// Display the attachment url for feedback
			die( wp_get_attachment_thumb_url( $id ) );
		}
	}

	/**
	 * Generate post thumbnail attachment meta data.
	 *
	 * @since 2.1.0
	 *
	 * @param int $attachment_id Attachment Id to process.
	 * @param string $file Filepath of the Attached image.
	 * @return mixed Metadata for attachment.
	 */
	function wp_generate_attachment_metadata_custom( $attachment_id, $file, $thumbnails = NULL ) {
		$attachment = get_post( $attachment_id );
	
		$metadata = array();
		if ( preg_match('!^image/!', get_post_mime_type( $attachment )) && file_is_displayable_image($file) ) {
			$imagesize = getimagesize( $file );
			$metadata['width'] = $imagesize[0];
			$metadata['height'] = $imagesize[1];
			list($uwidth, $uheight) = wp_constrain_dimensions($metadata['width'], $metadata['height'], 128, 96);
			$metadata['hwstring_small'] = "height='$uheight' width='$uwidth'";
	
			// Make the file path relative to the upload dir
			$metadata['file'] = _wp_relative_upload_path($file);
	
			// make thumbnails and other intermediate sizes
			global $_wp_additional_image_sizes;
	
			foreach ( get_intermediate_image_sizes() as $s ) {
				$sizes[$s] = array( 'width' => '', 'height' => '', 'crop' => FALSE );
				if ( isset( $_wp_additional_image_sizes[$s]['width'] ) )
					$sizes[$s]['width'] = intval( $_wp_additional_image_sizes[$s]['width'] ); // For theme-added sizes
				else
					$sizes[$s]['width'] = get_option( "{$s}_size_w" ); // For default sizes set in options
				if ( isset( $_wp_additional_image_sizes[$s]['height'] ) )
					$sizes[$s]['height'] = intval( $_wp_additional_image_sizes[$s]['height'] ); // For theme-added sizes
				else
					$sizes[$s]['height'] = get_option( "{$s}_size_h" ); // For default sizes set in options
				if ( isset( $_wp_additional_image_sizes[$s]['crop'] ) )
					$sizes[$s]['crop'] = intval( $_wp_additional_image_sizes[$s]['crop'] ); // For theme-added sizes
				else
					$sizes[$s]['crop'] = get_option( "{$s}_crop" ); // For default sizes set in options
			}
	
			$sizes = apply_filters( 'intermediate_image_sizes_advanced', $sizes );
	
			foreach ($sizes as $size => $size_data ) {
				if( isset( $thumbnails ) )
					if( !in_array( $size, $thumbnails ) )
						continue;
	
				$resized = image_make_intermediate_size( $file, $size_data['width'], $size_data['height'], $size_data['crop'] );
	
				if ( $resized )
					$metadata['sizes'][$size] = $resized;
			}
	
			// fetch additional metadata from exif/iptc
			$image_meta = wp_read_image_metadata( $file );
			if ( $image_meta )
				$metadata['image_meta'] = $image_meta;
	
		}
	
		return apply_filters( 'wp_generate_attachment_metadata', $metadata, $attachment_id );
	}
}
?>
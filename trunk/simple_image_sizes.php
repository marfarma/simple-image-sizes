<?php
/*
Plugin Name: Simple Image Size
Plugin URI: http://wordpress.org/extend/plugins/simple-image-sizes/
Description: Add an option in media setting page for images sizes
Version: 1.0.1
Author: Rahe
Author URI: http://www.beapi.fr
Text Domain: sis
Domain Path: /languages/
Network: false

Copyright 2010 Nicolas JUEN (njuen@beapi.fr) - Be-API

This plugin is not free to usage, not open-source, not GPL.
You can't use and modify this plugin without the permission of Be-API. (njuen@beapi.fr)
*/

define( 'SIS_URL', plugins_url('/', __FILE__) );
define( 'SIS_DIR', dirname(__FILE__) );

require_once( SIS_DIR . DIRECTORY_SEPARATOR . 'inc' . DIRECTORY_SEPARATOR . 'class.admin.php'  );
require_once( SIS_DIR . DIRECTORY_SEPARATOR . 'inc' . DIRECTORY_SEPARATOR . 'class.client.php'  );

add_action ( 'plugins_loaded', 'initSIS' );
function initSIS() {
	global $SIS;
	if( is_admin() )
		$SIS['admin'] = new SISAdmin();
	
	$SIS['client'] = new SISClient();
	
	load_plugin_textdomain ( 'sis', false, basename(rtrim(dirname(__FILE__), '/')) . '/languages' );

}
?>
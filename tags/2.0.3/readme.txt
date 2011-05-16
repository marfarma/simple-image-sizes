=== Simple Image Sizes ===
Contributors: Rahe
Donate link: http://www.beapi.fr/donate/
Tags: images, image, custom sizes, custom images, thumbnail regenerate, thumbnail, regenerate
Requires at least: 3.0
Tested up to: 3.2
Stable tag: 2.0.3

== Description ==

This plugin allow create custom image sizes for your site. Override your theme sizes directly on the media option page.
You can regenerate all the sizes you have just created and choose which one you wanted to regenerate.
You can now get all the code to copy and paste to your function theme file.
Now you can use the generated sizes directly into your posts and insert images at the right size !

== Installation ==
 **Required PHP5.**
 
1. Download, unzip and upload to your WordPress plugins directory
2. Activate the plugin within you WordPress Administration Backend
3. Go to Settings > Medias
4. Configure your new image sizes and regenerate the thumbnails !

== Screenshots ==

1. Settings page
2. Regenerating
3. In posts thumbnails

== Changelog ==
* 2.0.3
	* Resolve issue with theme sizes witch by default are displayed as not cropped. Thanks to momo360modena for the bug signalment.
* 2.0.2
	* Remove debug on php for javascript
	* Resolve issue with the different versions on jquery ( like in WP3.2 ) with attr return for checked components
* 2.0.1
	* Resolve javascript issue when clicking on delete button
	* Resolve issue of never unchecking crop button
* 2.0
	* Code refactoring
	* Update translations
	* Ajaxification of the process
		* Deleting by Ajax
		* Updating by Ajax
		* Adding by Ajax
	* Change UI
	* Change theme
	* Handle ajax errors
	* Handle not modified sizes, cropped
	* Handle same names
	* Sanitize the names
	* Customize jQuery ui
	* Customize jQuery ui theme
	* HTML5 Elements
	* CSS3 Animations
* 1.0.6
	* Minify javascript names
	* Change progressbar style
	* Add animations on progressbar
* 1.0.5
	* Only add css and js script in the media page to avoid any javascript error in other pages
	* Rectify css
	* Add function to get the code for the function.php file of the theme
	* Don't redefine the Wordpress basic size names
* 1.0.4
	* Fix the add_image_size issue ( height and width reversed )
* 1.0.3
	* Fix the plugin language
	* Add some translations
	* Externalise some css
	* Add sizes in the image adding to an article
	* Add setting link in the plugins list
	* Use admin_url instead of home_url
	* Add legend for colors
	* Some code refactoring
* 1.0.2
	* Fix the plugin license
* 1.0.1
	* Add POT file
	* Add french translation
* 1.0
	* First release
	* Thumbnail regenerate
	* Image size generation
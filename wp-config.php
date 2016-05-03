<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'test');

/** MySQL database username */
define('DB_USER', 'test_user');

/** MySQL database password */
define('DB_PASSWORD', 'password');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'Ur=hE@.pl>Xp>MC/y5j:e*J3!/E&ouP&t:uUcR!ATAely7V5--`bJ/)DZR9gV Gx');
define('SECURE_AUTH_KEY',  ' 33rIlDr;zFbS=:MJ7]VqVZ@OZnU#5V+ahjIht)N9{d_,[N2 bG<WGp1IbU!j|/$');
define('LOGGED_IN_KEY',    'Guvm~ryM1)X>TMT;!&SW2&2tek)0%KV+STn4*B4FkTP`v[]Wz>PY1P<n,>fFatrL');
define('NONCE_KEY',        '$^UL 9_q(y`>9vpf&&Td%Blmps4|4uc5t1X+9gv1cX]W97l~qJXt=wB9{yyl>|o#');
define('AUTH_SALT',        '7=?|Qh|i?61-^YTU)_FgM4$)_NqTqK!W3vW^72Gf4:q``X4lFj9el$Hl1om@SCg2');
define('SECURE_AUTH_SALT', '$+E!sezR@Ft^rg59:ByPfnYjjMj?`0<VBCt%.k9zXq~fRoOE?FGfUi<6Rfp(#{O.');
define('LOGGED_IN_SALT',   'L9`Nx.-e^2E5yiS`&5#D83yOJXrkfG8.RU8eljLP6fu_<C}qxh==y Sna[OWs-q~');
define('NONCE_SALT',       'Q[z)=po}6gP<h1WR_bebH8h8dsrtak7L^{nyzOGp| U=s<6R}#dHpP!INT& cLFA');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');

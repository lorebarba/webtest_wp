<?php
/**
 * This class manages AJAX responses for Cornerstone.
 * It uses routes.php to map actions to components and handler functions.
 * Cornerstone registers a custom endpoint that it will attempt to use first,
 * but it will failover to an Admin AJAX endpoint when needed.
 */

class Cornerstone_Router extends Cornerstone_Plugin_Component {

	protected $endpoint = 'cornerstone-endpoint';
	protected $response = array();
	protected $errors = array();
	protected $fatal_error = false;
	protected $routes = array();

	/**
	 * Instantiate and register AJAX handlers
	 */
	public function setup () {

		// Component routing
		$this->routes = include( $this->plugin->path( 'includes/routes.php' ) );
		$this->register_routes();

		// Custom Endpoint registration
		add_rewrite_endpoint( $this->endpoint, EP_ALL );
		add_action( 'template_redirect', array( $this, 'endpoint' ), -99999 );

		// Internal AJAX endpoint for failovers
		add_action( 'wp_ajax_cs_legacy_ajax', array( $this, 'flag_legacy_ajax' ) );

	}

	/**
	 * Attach hooke
	 * @return [type] [description]
	 */
	public function register_routes() {

		foreach ( $this->routes as $action => $route ) {

			add_action( 'wp_ajax_cs_' . $action, array( $this, 'router_router' ) );

			if ( isset( $route[3] ) && false === $route[3] ) {
				continue;
			}

			add_action( 'cornerstone_endpoint_cs_' . $action, array( $this, 'router_router' ) );

		}


	}

	/**
	 * Route an incoming request to the respective handler
	 * @return none
	 */
	public function router_router() {

		$action = str_replace( 'cornerstone_endpoint_cs_', '', str_replace( 'wp_ajax_cs_', '', current_action() ) );
		$this->begin_response();

		if ( ! isset( $this->routes[ $action ] ) ) {
			return cs_send_json_error( array( 'message' => "Registered Cornerstone route: `$action` could not be resolved." ) );
		}

		$component = $this->plugin->loadComponent( $this->routes[ $action ][0] );

		if ( false === $component ) {
			return cs_send_json_error( array( 'message' => "Registered Cornerstone route: `$action` does not have a valid component." ) );
		}

		$handler = array( $component, $this->routes[ $action ][1] );

		if ( ! is_callable( $handler ) ) {
			return cs_send_json_error( array( 'message' => "Registered Cornerstone route: `$action` does not have a valid response handler." ) );
		}

		do_action( 'cornerstone_before_ajax' );

		return call_user_func( $handler, $this->get_json() );

	}


	/**
	 * Handler for our custom endpoint. Faster than Admin AJAX, and more isolated,
	 * this handler will be Cornerstone's first attempt at responding to AJAX
	 * requests. When unavailable, the router will fallback to Admin AJAX.
	 * @return none
	 */
	public function endpoint() {

		global $wp_query;

		if ( ! isset( $wp_query->query_vars[ $this->endpoint ] ) || empty( $_REQUEST['action'] ) ) {
			return;
		}

		if ( ! defined( 'DOING_AJAX' ) ) {
			define( 'DOING_AJAX', true );
		}

		do_action( 'cornerstone_before_custom_endpoint' );

		send_origin_headers();
		@header( 'X-Robots-Tag: noindex' );
		send_nosniff_header();
		nocache_headers();

		$action = ( is_user_logged_in() ) ? 'cornerstone_endpoint_' : 'cornerstone_endpoint_nopriv_';
		do_action( $action . $_REQUEST['action'] );

		wp_die();

	}

	/**
	 * Cornerstone provides filtered versions of the WordPress success/error JSON
	 * response functions (see helpers.php). The filter is: _cornerstone_send_json_response
	 *
	 * We filter this here to attach debug information, and cache the response for
	 * our wp_die handler in case the output was at all corrupted.
	 *
	 * @param  mixed $response Response data to filter
	 * @return array         Response with debug data appended.
	 */
	public function filter_response( $response ) {

		if ( CS()->common()->isDebug() && is_array( $response ) ) {

			// Some general debug information
			$response['debug'] = array(
				'peak_memory' => memory_get_peak_usage(),
			);

			// Pass-through PHP errors
			if ( ! empty( $this->errors ) ) {
				$response['debug']['php_errors'] = $this->errors;
			}

		}

		if ( $this->fatal_error ) {
			$response['fatal_error'] = true;
		}

		$this->response = $response;

		return $response;

	}

	/**
	 * Mark the start of a response. Start output buffering so we can do error
	 * detection later, and register the wp_die handler.
	 * @return none
	 */
	public function begin_response() {
		ob_start();
		set_error_handler( array( $this, 'php_error_handler' ) );
		ini_set( 'display_errors', false );
		add_action( 'shutdown', array( $this, 'shutdown_handler' ) );
		add_filter( 'wp_die_ajax_handler', array( $this, 'get_wp_die_handler' ) );
		add_filter( '_cornerstone_send_json_response', array( $this, 'filter_response' ) );
	}

	/**
	 * Returns a callable reference to our wp_die handler
	 * @return array Reference to Cornerstone_Ajax_Handler::wp_die_handler
	 */
	public function get_wp_die_handler() {
		return array( $this, 'wp_die_handler' );
	}

	/**
	 * Custom handler for wp_die
	 * See WordPress filter: wp_die_ajax_handler
	 *
	 * This allows Cornerstone to detect extraneous output from 3rd party systems
	 * that could potentially corrupt the response. We also close out our custom
	 * error handler.
	 *
	 * @param  string $message Message to close response with.
	 * @return none
	 */
	function wp_die_handler( $message = '' ) {

		restore_error_handler();

		if ( $this->fatal_error ) {
			// Fatal errors will flush the output buffer, so we shouldn't continue.
			die();
		}

		$response = ob_get_clean();

		$begin = substr( $response, 0, 1 );
		$end = substr( $response, -1, 1 );

		// Crude (but fast) detection of non JSON before/after response
		if ( ! in_array( $begin, array( '{', '[' ), true ) || ! in_array( $end, array( '}', ']' ), true ) ) {

			if ( CS()->common()->isDebug() && is_array( $this->response['debug'] ) ) {
				$this->response['debug']['extraneous'] = $response;
			}

			echo wp_json_encode( $this->response );

		} else {
			echo $response; // Business as usual
		}

		// From WordPress function: _ajax_wp_die_handler
		if ( is_scalar( $message ) ) {
			die( (string) $message );
		}
		die( '0' );

	}


	public function php_error_handler( $errno, $errstr, $errfile, $errline ) {

		if ( ! ( error_reporting() & $errno ) ) {
			return;
		}

		$type = $this->lookup_error_type( $errno );
		$this->errors[] = "$type: $errstr in $errfile on line $errline.";

		// Don't execute PHP internal error handler
		return true;

	}

	public function lookup_error_type( $errno ) {

		switch ( $errno ) {
			case E_ERROR:
				return 'E_ERROR';
			case E_WARNING:
				return 'E_WARNING';
			case E_PARSE:
				return 'E_PARSE';
			case E_NOTICE:
				return 'E_NOTICE';
			case E_CORE_ERROR:
				return 'E_CORE_ERROR';
			case E_CORE_WARNING:
				return 'E_CORE_WARNING';
			case E_COMPILE_ERROR:
				return 'E_COMPILE_ERROR';
			case E_COMPILE_WARNING:
				return 'E_COMPILE_WARNING';
			case E_USER_ERROR:
				return 'E_USER_ERROR';
			case E_USER_WARNING:
				return 'E_USER_WARNING';
			case E_USER_NOTICE:
				return 'E_USER_NOTICE';
			case E_STRICT:
				return 'E_STRICT';
			case E_RECOVERABLE_ERROR:
				return 'E_RECOVERABLE_ERROR';
			case E_DEPRECATED:
				return 'E_DEPRECATED';
			case E_USER_DEPRECATED:
				return 'E_USER_DEPRECATED';
		}

		return '';

	}

	public function shutdown_handler() {

		$errno = error_get_last();

		if ( 1 === $errno['type'] ) {

			$type = $this->lookup_error_type( $errno['type'] );
			$this->errors[] = $type . ': ' . $errno['message'] . ' in ' . $errno['file'] . ' on line ' . $errno['line'] . '.';
			$this->fatal_error = true;

			cs_send_json_error();

		}

	}

	/**
	 * Flag this installation to use Legacy AJAX handling moving forwards. This is
	 * to allow for stability across many environments.
	 * @return none
	 */
	public function flag_legacy_ajax() {

		$this->begin_response();

		update_option( 'cs_legacy_ajax', true );

		// Manual reset
		if ( isset( $_REQUEST['state'] ) && ! $_REQUEST['state'] ) {
			delete_option( 'cs_legacy_ajax' );
		}

		cs_send_json_success();

	}

	/**
	 * Get JSON input from the incoming request. We try to use php://input to grab
	 * straight JSON, but it also supports base64encoded form data for less
	 * permissive environments
	 * @return array request data
	 */
	public function get_json() {

		$data = array();

		if ( 'POST' === $_SERVER['REQUEST_METHOD'] ) {
			if ( isset( $_POST['data'] ) ) { // WPCS: CSRF ok.
				if ( is_array( $_POST['data'] ) ) {
					return $_POST['data'];
				}
				$data = json_decode( base64_decode( $_POST['data'] ), true ); // WPCS: CSRF ok.
			} else {
				$data = json_decode( file_get_contents( 'php://input' ), true );
			}
		}

		return $data;
	}

	/**
	 * Whether or not this install has been instructed to use the legacy endpoints
	 * for Cornerstone. This means it will be looking for base64encoded form data
	 * POSTed to admin AJAX rather than our custom endpoint.
	 * @return boolean Whether or not legacy mode should be in effect.
	 */
	public function use_legacy_ajax() {
		if ( defined( 'CS_LEGACY_AJAX' ) ) {
			return CS_LEGACY_AJAX;
		}
		return ( false !== get_option( 'cs_legacy_ajax', false ) );
	}

	/**
	 * Get an URL that can be used on the front end to make requests. We try to
	 * make use of the custom endpoint, but will use a fallback if rewrite rules
	 * don't allow it.
	 * @return string Cornerstone AJAX url.
	 */
	public function get_ajax_url() {

		if ( ! isset( $this->ajax_url ) ) {
			$this->ajax_url = ( $this->endpoint_available() )
			? home_url( $this->endpoint )
			: $this->get_fallback_ajax_url();
		}

		return $this->ajax_url;

	}

	/**
	 * Returns a fallback AJAX url using Admin AJAX.
	 * @return string  Relative Admin AJAX url
	 */
	public function get_fallback_ajax_url() {
		return admin_url( 'admin-ajax.php', 'relative' );
	}

	/**
	 * Find out if the custom endpoint is available. Run a series of checks to
	 * see if Cornerstone rewrite rules exist, and if they don't, generate them
	 * if conditions are favorable.
	 * @return boolean Whether or not we can use the custom endpoint
	 */
	public function endpoint_available() {

		if ( is_multisite() || $this->use_legacy_ajax() ) {
			return false;
		}

		$structure = get_option( 'permalink_structure' );

		// Permalinks disabled
		if ( ! $structure ) {
			return false;
		}

		if ( false !== strpos( $structure, 'index.php' ) ) {
			return false; // Don't support PATHINFO rules
		}

		$rules = get_option( 'rewrite_rules' );

		// No rules generated (permalinks disabled)
		if ( ! $rules ) {
			return false;
		}

		// Check if our rules are present
		foreach ($rules as $rule) {
			if ( false === strpos( $rule, 'cornerstone-endpoint' ) ) {
				continue;
			}
			return true;
		}

		// If not present, and conditions are favorable, generate the rules.

		// flush_rewrite_rules is expensive, so only call under specific conditions:
		// * Permalinks are enabled
		// * Only if permalinks are enabled
		// * Confirm our rules don't already exist
		// * On init, or later
		if ( did_action( 'init' ) ) {
			flush_rewrite_rules();
		} else {
			add_action( 'init', 'flush_rewrite_rules', 9999 );
		}

		return false;

	}

}

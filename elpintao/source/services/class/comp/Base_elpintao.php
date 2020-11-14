<?php

require_once("Base_elpintao_sin_sesion.php");

class class_Base_elpintao extends class_Base_elpintao_sin_sesion
{
	protected $id_login;
	
	function __construct() {
		
		$request_uri = $_SERVER['REQUEST_URI'];
		$build = strstr($request_uri, 'build', true);
		$source = strstr($request_uri, 'source', true);
		if ($build) {
			$request_uri = $build . 'build';
		} else if ($source) {
			$request_uri = $source . 'source';
		} else {
			die('REQUEST_URI');
		}
		
		$this->id_login = md5($request_uri);
		
		if (is_null($_SESSION[$this->id_login])) {
			throw new JsonRpcError("sesion_terminada", 0);
		}
		
		parent::__construct();
	}
}

?>
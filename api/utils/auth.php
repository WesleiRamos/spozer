<?php

include_once __DIR__ . '/functions.php';
include_once __DIR__ . '/user.php';

$CURRENT_URI = trim($_SERVER['REQUEST_URI']);

// Se a requisição é logout, então deletamos a sessão do usuário
if (strpos($CURRENT_URI, '/logout') === 0) {
  User::logout_user(isset($_GET['token']) ? trim($_GET['token']) : '');
  exit;

} else {
  // Se está logado, então redirecionamos ao inicio
  User::if_logged_redirect_home();
}

if  (strtolower($_SERVER['REQUEST_METHOD']) === 'post') {
  // Executa uma ação caso o método seja post
  $action_result = strpos($CURRENT_URI, '/login') === 0
    ? User::login_user()
    : User::register_user();

  switch ($action_result[0]) {
    case 200:
      User::redirect_to($action_result[1]);
      break;

    default:
      [ $ERROR_CODE, $ERROR_MESSAGE ] = $action_result;
      break;
  }
} 
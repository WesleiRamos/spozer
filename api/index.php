<?php

/** 
 * A ideia aqui é primeiro de tudo deixar as urls um pouco mais bonitas sem o ".php",
 * claro não só isso, mas poder importar algo mais "globalmente" como a conexão
 * e as rotas, já que são usadas em todos os arquivos, eu também estarei ve-
 * rificando se o usuário está logado para acessar essa página, assim eu consigo
 * checar em tudo sem ter que fazer em cada arquivo, e as rotas que deveriam ser
 * executadas em todos os arquivos, eu deixo aqui também
 */
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT');

define('ROOT_PATH'    , $_SERVER['DOCUMENT_ROOT']);
define('UTILS_PATH'   , __DIR__     . '/utils');
define('UPLOAD_PATH'  , ROOT_PATH   . '/public/uploads');
define('AUDIOS_PATH'  , UPLOAD_PATH . '/audio');
define('COVERS_PATH'  , UPLOAD_PATH . '/covers');
define('PICTURES_PATH', UPLOAD_PATH . '/pictures');
define('ARTWORKS_PATH', UPLOAD_PATH . '/artworks');
define('ARTWORK_DEFAULT_SIZE', 500);
define('PICTURE_DEFAULT_SIZE', 640);

include_once UTILS_PATH . '/user.php';
User::is_user_authorized();

include_once UTILS_PATH . '/router.php';
include_once UTILS_PATH . '/functions.php';
include_once $_GET['route_include'] . '.php';
Router::exec_router();

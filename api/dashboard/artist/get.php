<?php

include_once UTILS_PATH . '/artists.php';

/**
 * Retorna o resultado da pesquisa por artistas
 */
Router::get(function ($router, $connection) {
  return Artists::search_artists($router::from('term', ''), intval($router::from('limit', 10)));
});
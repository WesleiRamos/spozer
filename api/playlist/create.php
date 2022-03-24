<?php

include_once UTILS_PATH . '/playlist.php';

/**
 * Cria a playlist e retorna
 */
Router::post(function($router, $connection) {
  $name = trim($router::from('name'));
  if (strlen($name) < 2)
    throw new RouteException('O nome da playlist deve ter no mínimo 2 caracteres', 412);

  return Playlist::create_playlist(User::get_user_id(), $name);
});

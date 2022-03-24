<?php

include_once UTILS_PATH . '/album.php';
include_once UTILS_PATH . '/songs.php';

/**
 * Retorna as informações do album
 */
Router::get(function ($router, $connection) {
  $id = $router::from('id', 0);
  if ($id <= 0)
    throw new RouteException('Id inválido', 412);

  return [
    'album' => Album::get_album($id),
    'songs' => Songs::get_songs_from_album(User::get_user_id(), $id)
  ];
});
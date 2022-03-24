<?php

include_once UTILS_PATH . '/artists.php';
include_once UTILS_PATH . '/album.php';
include_once UTILS_PATH . '/songs.php';

/**
 * Retorna as informações do artista
 */
Router::get(function ($router, $connection) {
  $id = $router::from('id', 0);
  if ($id <= 0)
    throw new RouteException('Id inválido', 412);

  return [
    'artist' => Artists::get_artist($id),
    'albums' => [
      'own' => Album::get_artist_albums($id),
      'appearsOn' => Album::get_albums_artist_appears_on($id)
    ],
    'songs' => Songs::get_artist_songs(User::get_user_id(), $id)
  ];
});
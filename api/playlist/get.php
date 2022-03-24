<?php

include_once UTILS_PATH . '/playlist.php';
include_once UTILS_PATH . '/songs.php';

/**
 * Retorna as musicas da playlist informada
 */
Router::get(function($router, $connection) {
  $playlist = $router::from('playlist');
  if ($playlist <= 0)
    throw new RouteException('A playlist informado é inválida', 412);

  return [
    'playlist' => Playlist::get_playlist($playlist),
    'songs' => Songs::get_playlist_songs(User::get_user_id(), $playlist)
  ];
});

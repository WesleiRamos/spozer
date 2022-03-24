<?php

include_once UTILS_PATH . '/playlist.php';

/**
 * Cria a playlist e retorna
 */
Router::post(function($router, $connection) {
  $playlist = $router::from('playlist');
  if ($playlist <= 0)
    throw new RouteException('A playlist informado é inválida', 412);

  $song = $router::from('song');
  if ($song <= 0)
    throw new RouteException('A música informada é inválida', 412);

  return Playlist::remove_song_from_playlist(User::get_user_id(), $playlist, $song);
});

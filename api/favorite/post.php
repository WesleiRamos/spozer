<?php

include_once UTILS_PATH . '/songs.php';

/**
 * Favorita ou desfavortia uma musica
 */
Router::post(function ($router, $connection) {
  $id = $router::from('id', 0);
  if ($id <= 0)
    throw new RouteException('Id inválido', 412);
    
  $action = $router::from('action', false);
  if (!is_bool($action))
    throw new RouteException('Ação inválida', 412);

  return [
    'value' => $action ? Songs::favorite_song(User::get_user_id(), $id) : Songs::remove_song_from_favorite(User::get_user_id(), $id)
  ];
});
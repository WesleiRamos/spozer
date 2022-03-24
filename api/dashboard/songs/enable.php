<?php

include_once UTILS_PATH . '/songs.php';

/**
 * Habilita ou desabilita uma musica
 */
Router::put(function ($router, $connection) {
  $id = $router::from('id');
  if ($id <= 0)
    throw new RouteException('O id informado é inválido', 412);

  $enable = $router::from('enable');
  if (!is_bool($enable))
    throw new RouteException('O campo "enable" tem um valor inválido', 412);
  
  return [ 'enabled' => Songs::enable_disable_song(User::get_user_id(), $id, (int) $enable) ];
});
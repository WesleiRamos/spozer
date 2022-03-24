<?php

include_once UTILS_PATH . '/album.php';
include_once UTILS_PATH . '/files.php';

/**
 * Cria o album e retorna-o
 */
Router::post(function($router, $connection) {
  $name = $router::from('name');
  if (strlen($name) === 0)
    throw new RouteException('O nome não pode estar vazio', 412);

  $type = $router::from('type');
  if (!($type === 'single' || $type === 'album'))
    throw new RouteException('O tipo do album inválido', 412);

  $artists = $router::from('artists', 0);
  if ($artists === 0) {
    $artists = [];
  
  } else if (!is_array($artists)) {
    throw new RouteException('O campo "artists" deve ser um array', 412);
  }

  $released = strtotime($router::from('released'));
  if (!$released)
    throw new RouteException('O campo "released" deve ser uma data válida', 412);
  else
    $released = date('Y-m-d', $released);

  $artwork = new File($router::from('artwork'));
  if ($artwork->file_is_null())
    throw new RouteException('Artwork não informada', 412);

  if (!$artwork->file_type_is_in([ 'jpg', 'jpeg', 'png' ]))
    throw new RouteException('Apenas aceitamos imagens jpg ou png', 412);

  Album::create_album(User::get_user_id(), $name, $type, $released, array_unique($artists), $artwork->save_file_as_artwork());
  return Album::get_albums_with_artists_from_owner(User::get_user_id());
});

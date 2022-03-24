<?php

include_once UTILS_PATH . '/album.php';
include_once UTILS_PATH . '/files.php';

/**
 * Edita as informações do album
 */
Router::post(function ($router, $connection) {
  $id = $router::from('id');
  if ($id <= 0)
    throw new RouteException('O id informado é inválido', 412);

  $name = $router::from('name');
  if (strlen($name) === 0)
    throw new RouteException('O nome não pode estar vazio', 412);

  $type = $router::from('type');
  if (!($type === 'single' || $type === 'album'))
    throw new RouteException('O tipo do album inválido', 412);

  $artists = $router::from('artists', []);
  if (!is_array($artists)) 
    throw new RouteException('O campo "artists" deve ser um array', 412);

  $released = strtotime($router::from('released'));
  if (!$released)
    throw new RouteException('O campo "released" deve ser uma data válida', 412);
  else
    $released = date('Y-m-d', $released);
    
  $artwork = $router::from('artwork');
  if ($artwork === 'null') {
    $artwork = Album::get_current_album_artwork($id);
  } else {
    $artwork = new File($artwork);
    if (!$artwork->file_type_is_in([ 'jpg', 'jpeg', 'png' ]))
      throw new RouteException('Apenas aceitamos imagens jpg ou png', 412);

    $artwork = $artwork->save_file_as_artwork();
    File::delete_artwork(Album::get_current_album_artwork($id));
  }

  Album::edit_album($id, User::get_user_id(), $name, $type, $released, array_unique($artists), $artwork);
  return Album::get_albums_with_artists_from_owner(User::get_user_id());
});
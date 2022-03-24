<?php

include_once UTILS_PATH . '/album.php';
include_once UTILS_PATH . '/songs.php';
include_once UTILS_PATH . '/files.php';

/**
 * Retorna todas as musicas do artista
 */
Router::post(function ($router, $connection) {
  $name = $router::from('name');
  if (strlen($name) === 0)
    throw new RouteException('O nome não pode estar vazio', 412);

  $artists = $router::from('artists', []);
  if (!is_array($artists))
    throw new RouteException('O campo "artists" deve ser um array', 412);
  
  $album = $router::from('album');
  if ($album <= 0)
    throw new RouteException('Album inválido', 412);

  if (!Album::check_if_album_exists($album, User::get_user_id()))
    throw new RouteException('Album não encontrado', 422);

  $song = new File($router::from('song'));
  if ($song->file_is_null())
    throw new RouteException('Arquivo não enviado', 412);

  if (!$song->file_type_is_in([ 'mpeg' ]))
    throw new RouteException('Apenas aceitamos musicas mp3', 412);

  Songs::create_song(User::get_user_id(), $album, $name, Songs::get_length_from_file($song), $artists, $song->save_file_as_song());
  return [ 'ok' => true ];
});
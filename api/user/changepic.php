<?php

include_once UTILS_PATH . '/files.php';

/**
 * Retorna letra de uma musica
 */
Router::post(function($router, $connection) {
  $picture = new File($router::from('picture'));
  if ($picture->file_is_null())
    throw new RouteException('A nova foto não foi informada', 412);

  if (!$picture->file_type_is_in([ 'jpg', 'jpeg', 'png' ]))
    throw new RouteException('Apenas aceitamos fotos jpg ou png', 412);

  return User::change_profile_picture($picture->save_file_as_picture());
});

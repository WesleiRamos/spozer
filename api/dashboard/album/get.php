<?php

include_once UTILS_PATH . '/album.php';
include_once UTILS_PATH . '/files.php';

/**
 * Retorna os albums do artista, caso seja passado o parametro artists
 * então retornamos todos os artistas do album
 */
Router::get(function($router, $connection) {
  return $router::from('artists', 0) === 0
    ? Album::get_albums_from_owner(User::get_user_id())
    : Album::get_albums_with_artists_from_owner(User::get_user_id());
});


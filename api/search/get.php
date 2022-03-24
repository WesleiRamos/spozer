<?php

include_once UTILS_PATH . '/songs.php';
include_once UTILS_PATH . '/album.php';
include_once UTILS_PATH . '/artists.php';

/**
 * Procura por musicas, artistas ou albums (playlist talvez?)
 */
Router::get(function($router, $connection) {
  $term = term_to_wildcard($router::from('term'));
  if (strlen($term) === 0)
    return [ 'ok' => true ];
    
  return [
    'songs' => Songs::search_song_by_match(User::get_user_id(), $term),
    'artists' => Artists::search_artists_by_match($term),
    'albums' => Album::search_album_by_match($term)
  ];
});
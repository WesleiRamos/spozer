<?php

include_once UTILS_PATH . '/songs.php';

/**
 * Retorna todas as musicas do artista
 */
Router::get(function ($router, $connection) {
  return Songs::get_dashboard_songs_from_owner(User::get_user_id());
});
<?php

include_once UTILS_PATH . '/songs.php';

/**
 * Retorna a lista de musicas favoritas do usuário
 */
Router::get(function ($router, $connection) {
  return Songs::get_favorite_songs(User::get_user_id());
});
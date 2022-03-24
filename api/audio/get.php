<?php

include_once UTILS_PATH . '/songs.php';

/**
 * Retorna o arquivo da musica
 */
Router::get(function ($router, $connection) {
  $id = $router::from('id', 0);
  if ($id <= 0)
    throw new RouteException('Id inválido', 412);

  // O normal aqui é buscar o id do arquivo e retornar
  // mas como as musicas tem copyright e eu não quero
  // subir pro github com elas então ignoramos
  //return Songs::get_audio_file($id);

  // musica sem copyright, pelo menos eu acredito que não tenha
  // https://www.youtube.com/watch?v=lTwessnK0hQ
  return [
    'file_id' => 'cc637b68ab9811ecb9090242ac120002'
  ]; 
});
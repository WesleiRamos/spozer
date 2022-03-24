<?php

/**
 * Retorna a letra direto do vagalume
 * @param string $artist
 * @param string $song
 * @return array
 */
function request_lyric($artist, $song) {
  $result = json_decode(file_get_contents("https://api.vagalume.com.br/search.php?art=$artist&mus=$song"), true);
  if ($result['type'] === 'exact' || $result['type'] === 'aprox')
    return [ 'ok' => true, 'lyric' => $result['mus'][0]['text'] ];

  return [ 'ok' => false ];
}

/**
 * Retorna letra de uma musica
 */
Router::get(function($router, $connection) {
  $artist = isset($_GET['artist']) ? trim($_GET['artist']) : '';
  if (strlen($artist) <= 1)
    throw new RouteException('Artista invalido', 412);

  $song = isset($_GET['song']) ? trim($_GET['song']) : '';
  if (strlen($song) <= 1)
    throw new RouteException('Música invalida', 412);

  return request_lyric(urlencode($artist), urlencode($song));
});

<?php

/**
 * Retorna uma lista predefinida de musicas como apresentação
 * @return string
 */
function fake_featured_songs() {
  return json_decode(file_get_contents(__DIR__ . '/data.json'));
}
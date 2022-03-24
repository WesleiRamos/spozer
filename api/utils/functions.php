<?php

/**
 * Retorna um id unico, uniquid poderia criar ids iguais (apesar de eu não ter
 * certeza se essa solução não produz o mesmo), código adaptado de https://stackoverflow.com/a/15875555,
 * requer php 7
 * 
 * @return string
 */
function guidv4() {
  $data = random_bytes(16);
  $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
  $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
  return vsprintf('%s%s%s%s%s%s%s%s', str_split(bin2hex($data), 4));
}

/**
 * Verifica se o guid informado é valido
 * @param string $gui
 * @return boolean
 */
function validguid($guid) {
  return preg_match('/^[0-9a-f]{32}$/', $guid);
}

/**
 * Checa se é array map ou é uma lista
 * Código obtido de https://wiki.php.net/rfc/is_list
 * @param array $array
 * @return boolean
 */
function array_is_list($array) {
  $expectedKey = 0;
  foreach ($array as $i => $_) {
    if ($i !== $expectedKey++)
      return false;
  }
  return true;
}

/**
 * Adiciona um * no fim de cada palavra do termo
 * @param string $term
 * @return string
 */
function term_to_wildcard($term) {
  return join('|', array_map(function ($word) {
    return strlen($word) === 0 ? '' : trim($word) . '*';
  }, explode(' ', $term)));
}

/**
 * Formata os valores necessários
 * @param array $object
 * @return array
 */
function format_values($object) {
  if (array_is_list($object)) {
    $count = count($object);
    for ($i = 0; $i < $count; $i++) {
      if (is_array($object[$i]))
        $object[$i] = format_values($object[$i]);
    }
  } else {
    foreach ($object as $key => $value) {
      if (is_array($value)) {
        $object[$key] = format_values($value);

      } else {
        switch ($key) {
          // case 'id':
          case 'length':
            $object[$key] = intval($value);
            break;

          case 'enabled':
          case 'verified_artist':
          case 'favorite':
            if (is_string($value)) {
              $object[$key] = $value === '1' ? true : false;
            }
            break;
        }
      } 
    }
  }

  return $object;
}
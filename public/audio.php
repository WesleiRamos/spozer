<?php

/**
 * Faz stream de pedaços de um audio
 * (codigo feito com base em https://gist.github.com/benrolfe/5453074)
 */
class StreamAudio {

  private static $size   = 0;
  private static $length = 0;
  private static $start  = 0;
  private static $end    = 0;
  private static $stream = null;
  private static $buffer = 262144; // 256 kb

  /**
   * Abre o arquivo para retornar a parte que se quer
   */
  private static function open($path) {
    if (!(self::$stream = fopen($path, 'rb')))
      exit;
  }

  /**
   * Envia qual parte do arquivo foi enviada
   * @param string $status
   * @param string $description
   */
  private static function change_range_header($status = '206', $description = 'Partial Content') {
    header("Content-Type: audio/mpeg");
    header("HTTP/1.1 $status $description");
    if ($status === '206') {
      header("Accept-Ranges: bytes");
      header(sprintf("Content-Length: %d", self::$length));
      header(sprintf("Content-Range: bytes %d-%d/%d", self::$start, self::$end, self::$size));
    }
  }

  /**
   * Obtém o range que a requisição espera
   * @return array
   */
  private static function get_header_range() {
    if (!isset($_SERVER['HTTP_RANGE']))
      return null;

    preg_match('/bytes=(\d+)-(\d+)?/', $_SERVER['HTTP_RANGE'], $range);
    if (count($range) <= 2) {
      return [
        'start' => (int) $range[1],
        'end' => $range[1] + self::$buffer
      ];
    }

    return [ 'start' => (int) $range[1], 'end' => (int) $range[2] ];
  }

  /**
   * Define as varivaveis e os cabeçalhos de resposta
   * @param string $path
   */
  private static function set_headers($path) {
    self::$size = self::$length = filesize($path);

    $audio_range = self::get_header_range();
    if ($audio_range === null) {
      return self::change_range_header('416', 'Requested Range Not Satisfiable');
    }
      
    self::$start  = $audio_range['start'];
    self::$end    = min($audio_range['end'], self::$size - 1);
    self::$length = self::$end - self::$start + 1;
    self::change_range_header();
  }

  /**
   * Faz a stream do audio informado
   * @param string $path
   */
  public static function stream_audio($path) {
    self::set_headers($path);
    self::open($path);
    fseek(self::$stream, self::$start);

    set_time_limit(0);
    $read_bytes = self::$buffer; // Quantia de dados a serem lidos

    // Enquanto não chegar ao fim do arquivo e o ponteiro do arquivo não tiver chego ao fim
    while (!feof(self::$stream) && ($pointer = ftell(self::$stream)) <= self::$end) {
      // Checa se estou tentando ler uma quantia de dados maior do que resta,
      // altera a quantia para somente o que falta a ser lido
      if ($pointer + self::$buffer > self::$end) {
        $read_bytes = self::$end - $pointer + 1;
      }

      echo fread(self::$stream, $read_bytes);
      flush();
    }

    fclose(self::$stream);
  }
}
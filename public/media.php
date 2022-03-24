<?php

define('ROOT_PATH'    , $_SERVER['DOCUMENT_ROOT']);
define('UPLOAD_PATH'  , ROOT_PATH   . '/public/uploads');
define('AUDIO_PATH'   , UPLOAD_PATH . '/audio');
define('PICTURES_PATH', UPLOAD_PATH . '/pictures');
define('ARTWORKS_PATH', UPLOAD_PATH . '/artworks');

include_once './audio.php';
include_once ROOT_PATH . '/api/utils/functions.php';

class Media {

  private static $type = null;
  private static $file = null;

  /**
   * Caso o arquivo não seja encontrado retornamos 404
   */
  private static function not_found() {
    header("HTTP/1.1 404");
    exit;
  }

  /**
   * Tenta obt
   */
  private static function get_media_vars() {
    self::$type = isset($_GET['media_type']) ? $_GET['media_type'] : null;
    self::$file = isset($_GET['media_file']) ? $_GET['media_file'] : null;
  }

  /**
   * Define o tipo do arquivo a ser retornado
   * @param string $mime
   */
  private static function define_content_type($mime) {
    header("Content-Type: $mime");
  }

  /**
   * Retorna o caminho do arquivo
   * @param string $folder
   * @return string
   */
  private static function get_file_path($folder, $type = 'jpg') {
    $path = sprintf("%s/%s.%s", $folder, self::$file, $type);
    if (!file_exists($path))
      self::not_found();
    return $path;
  }

  /**
   * Retorna uma imagem com base no caminho informado
   * @param string $path
   */
  private static function return_image($path) {
    self::define_content_type('image/jpg');
    readfile($path);
  }

  /**
   * Retorna a midia requisitada
   */
  public static function return_requested_file() {
    self::get_media_vars();
    switch (self::$type) {
      case 'artwork':
        return self::return_image(self::get_file_path(ARTWORKS_PATH));

      case 'picture':
        return self::return_image(self::get_file_path(PICTURES_PATH));

      case 'audio':
        return StreamAudio::stream_audio(self::get_file_path(AUDIO_PATH, 'mp3'));

      default:
        self::not_found();
    }
  }
}

Media::return_requested_file();
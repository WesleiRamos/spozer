<?php

class File {

  private $file;
  public $saved_file_name;

  /**
   * Construtor da classe
   */
  public function __construct($file = null) {
    $this->file = $file;
  }

  /**
   * @return bool
   */
  public function file_is_null() {
    return $this->file === null;
  }

  /**
   * Retorna o caminho do arquivo
   * @return string
   */
  public function get_file_path() {
    return $this->file['tmp_name'];
  }

  /**
   * Retorna o subtipo do mimetype do arquivo
   * @return string
   */
  public function get_mime_subtype() {
    return explode('/', $this->file['type'])[1];
  }

  /**
   * Checa o tipo pelo mimetype, porém ainda sim pode ser outro tipo
   * de arquivo
   * @param array $arr
   * @return bool
   */
  public function file_type_is_in($arr) {
    $subtype = $this->get_mime_subtype();
    foreach ($arr as $type) {
      if ($type === $subtype)
        return true;
    }

    return false;
  }

  /**
   * Converte a imagem para jpeg e redimensiona, código adaptado de
   * https://stackoverflow.com/a/14549647 e https://www.php.net/manual/pt_BR/function.imagecopyresampled.php
   * 
   * @param string $output
   */
  private function convert_image_to_jpeg($output, $width, $height) {
    switch ($this->get_mime_subtype()) {
      case 'jpg':
      case 'jpeg':
        $image = imagecreatefromjpeg($this->get_file_path());
        break;

      case 'png':
        $image = imagecreatefrompng($this->get_file_path());
        break;

      default:
        throw new RouteException('Tipo de arquivo não reconhecido', 412);
    }

    $resized = imagecreatetruecolor($width, $height);
    imagecopyresampled($resized, $image, 0, 0, 0, 0, $width, $height, imagesx($image), imagesy($image));
    imagejpeg($resized, $output, 100);

    imagedestroy($image);
    imagedestroy($resized);
  }

  /**
   * Converte a imagem para jpg, redimensiona, salva e retorna o nome do arquivo
   * @return string
   */
  public function save_file_as_artwork() {
    $name = $this->saved_file_name = guidv4();
    $this->convert_image_to_jpeg(ARTWORKS_PATH . "/$name.jpg", ARTWORK_DEFAULT_SIZE, ARTWORK_DEFAULT_SIZE);
    return $this->saved_file_name;
  }

  /**
   * @return bool
   */
  public static function delete_artwork($artwork) {
    return unlink(ARTWORKS_PATH . "/$artwork.jpg");
  }

  /**
   * Salva a musica e retorna o nome
   * @return string
   */
  public function save_file_as_song() {
    $name = $this->saved_file_name = guidv4();
    if (!move_uploaded_file($this->get_file_path(), AUDIOS_PATH . "/$name.mp3"))
      throw new RouteException("Não foi possível fazer o upload da música");

    return $this->saved_file_name;
  }

  /**
   * @return bool
   */
  public function delete_song($name) {
    return unlink(AUDIOS_PATH . "/$name.mp3");
  }

  /**
   * Converte a imagem para jpg, redimensiona, salva e retorna o nome do arquivo
   * @return string
   */
  public function save_file_as_picture() {
    $name = $this->saved_file_name = guidv4();
    $this->convert_image_to_jpeg(PICTURES_PATH . "/$name.jpg", PICTURE_DEFAULT_SIZE, PICTURE_DEFAULT_SIZE);
    return $this->saved_file_name;
  }

  /**
   * @return bool
   */
  public static function delete_picture($picture) {
    return unlink(PICTURES_PATH . "/$picture.jpg");
  }
}
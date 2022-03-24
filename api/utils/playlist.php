<?php

class Playlist {

  /**
   * Conexão mysql
   * @var mysqli
   */
  private static $connection = null;

  /**
   * "Construtor" da classe
   */
  public static function __constructStatic() {
    global $connection;
    self::$connection = $connection;
  }

  /**
   * Checa se a playlist é do usuário
   * @param int $user
   * @param int $id
   * @return string
   */
  public static function check_if_playlist_exists($user, $id) {
    return self::$connection->query("SELECT id FROM playlist WHERE id = $id AND owner = $user LIMIT 1")->num_rows === 1;
  }

  /**
   * Cria uma nova playlist
   * @param int $user
   * @param string $name
   * @return array
   */
  public static function create_playlist($user, $name) {
    if (!self::$connection->query("INSERT INTO playlist (owner, name) VALUES ($user, '$name')"))
      throw new RouteException("Não foi possível criar a playlist");

    return [ 'id' => self::$connection->insert_id, 'name' => $name ];
  }

  /**
   * Insere uma musica na playlist
   * @param int $user
   * @param int $playlist
   * @param int $song
   * @return array
   */
  public static function insert_song_into_playlist($user, $playlist, $song) {
    if (!self::check_if_playlist_exists($user, $playlist))
      throw new RouteException("A playlist informada não existe", 404);

    if (!self::$connection->query("INSERT INTO playlist_song (playlist, song) VALUES ($playlist, $song)"))
      throw new RouteException("Não foi possível inserir a música na playlist");

    return [ 'ok' => true ];
  }

  /**
   * Deleta uma musica da playlist
   * @param int $user
   * @param int $song
   * @return array
   */
  public static function remove_song_from_playlist($user, $playlist, $song) {
    if (!self::check_if_playlist_exists($user, $playlist))
      throw new RouteException("A playlist informada não existe", 404);

    if (!self::$connection->query("DELETE FROM playlist_song WHERE id = $song"))
      throw new RouteException("Não foi possível deletar a música da playlist");

    return [ 'ok' => true ];
  }

  /**
   * Retorna todas as playlists do usuário
   * @param int $user
   * @return array
   */
  public static function get_user_playlists($user) {
    return self::$connection
      ->query("SELECT id, name FROM playlist WHERE owner = $user")
      ->fetch_all(MYSQLI_ASSOC);
  }

  /**
   * Retorna as informações da playlist
   * @param int $playlist
   * @return array
   */
  public static function get_playlist($playlist) {
    $result = self::$connection
      ->query("SELECT id, name, created_at FROM playlist WHERE id = $playlist")
      ->fetch_all(MYSQLI_ASSOC);

    if (count($result) === 0)
      throw new RouteException("A playlist informada não existe", 404);

    return $result[0];
  }
}

Playlist::__constructStatic();
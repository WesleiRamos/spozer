<?php

include_once __DIR__ . '/artists.php';
include_once __DIR__ . '/album.php';
include_once __DIR__ . '/zeedwood/mp3.php';
include_once __DIR__ . '/fake/featured.php';

class Songs {

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
   * Retorna o tamanho da musica com base no arquivo passado
   * @param File $file
   * @return int
   */
  public static function get_length_from_file($file) {
    return (new MP3File($file->get_file_path()))->getDuration();
  }

  /**
   * Retorna as musicas "apresentadas" (não sei como ficaria em pt)
   * @return string
   */
  public static function featured_songs() {
    return fake_featured_songs();
  }

  /**
   * Retorna as musicas recomendadas
   * @return string
   */
  public static function recommended_songs($user) {
    $result = self::$connection
      ->query("SELECT song.id, song.name, song.length, IF(song_favorite.song is null, 0, 1) as favorite, user.id as artist_id, user.artistic_name as artistic_name, album.id AS albumid, album.name AS album, album.artwork
        FROM (SELECT * FROM song WHERE song.enabled = 1 ORDER BY RAND() LIMIT 10 ) AS song
        
        INNER JOIN album
          ON album.id = song.album
        
        INNER JOIN song_artist
          ON song_artist.song = song.id
        
        INNER JOIN user
          ON user.id = song_artist.artist
        
        LEFT JOIN song_favorite
          ON song_favorite.song = song.id AND song_favorite.user = $user"
      )
      ->fetch_all(MYSQLI_ASSOC);

    return format_values(Album::merge_album_data(Artists::merge_artists($result)));
  }

  /**
   * Retorna o nome do arquivo da musica
   * @return
   */
  public static function get_audio_file($id) {
    $result = self::$connection
      ->query("SELECT `file` as `file_id` FROM song WHERE id = $id")
      ->fetch_all(MYSQLI_ASSOC);

    if (count($result) === 0)
      throw new RouteException("Música não encontrada");

    return $result[0];
  }

  /**
   * Cria uma nova musica
   * @return bool
   */
  public static function create_song($owner, $album, $name, $length, $artists, $file) {
    if (!in_array($owner, $artists))
      array_unshift($artists, $owner);

    if (!self::$connection->query("INSERT INTO song (album, owner, name, file, length) VALUES ($album, $owner, '$name', '$file', $length)"))
      throw new RouteException("Não foi possível criar a musica");

    if (!Artists::insert_artists_into_song(self::$connection->insert_id, $artists))
      throw new RouteException("Não foi possivel inserir os artistas na musica");

    return true;
  }

  /**
   * Retorna a playlist de musicas favoritas do usuário
   * @param int $user
   * @return array
   */
  public static function get_favorite_songs($user) {
    $result = self::$connection
      ->query("SELECT song.id, song.name, song.length, IF(song_favorite.song is null, 0, 1) as favorite, song_favorite.created_at as added_at, user.id as artist_id, user.artistic_name as artistic_name, album.id AS albumid, album.name AS album, album.artwork
        FROM song
        INNER JOIN song_favorite
          ON song_favorite.user = $user AND song_favorite.song = song.id
        
        INNER JOIN album
          ON album.id = song.album
        
        INNER JOIN song_artist
          ON song_artist.song = song.id
        
        INNER JOIN user
          ON user.id = song_artist.artist
          
        WHERE song.enabled = 1"
      )
      ->fetch_all(MYSQLI_ASSOC);

    return Album::merge_album_data(Artists::merge_artists($result));
  }

  /**
   * Retorna as musicas da playlist informada
   * @param int $user
   * @param int $playlist
   * @return array
   */
  public static function get_playlist_songs($user, $playlist) {
    $result = self::$connection
      ->query("SELECT song.id, playlist_song.id as pid, song.name, song.length, IF(song_favorite.song is null, 0, 1) as favorite, playlist_song.created_at as added_at, user.id as artist_id, user.artistic_name as artistic_name, album.id AS albumid, album.name AS album, album.artwork
        FROM song
        
        INNER JOIN playlist_song
          ON playlist_song.playlist = $playlist AND playlist_song.song = song.id
        
        INNER JOIN album
          ON album.id = song.album
        
        INNER JOIN song_artist
          ON song_artist.song = song.id
        
        INNER JOIN user
          ON user.id = song_artist.artist
          
        LEFT JOIN song_favorite
          ON song_favorite.user = $user AND song_favorite.song = song.id
        
        WHERE song.enabled = 1"
      )
      ->fetch_all(MYSQLI_ASSOC);

    return Album::merge_album_data(Artists::merge_artists($result));
  }

  /**
   * Retorna as musicas de um album especifico
   * @return array
   */
  public static function get_songs_from_album($user, $album) {
    $result = self::$connection
      ->query("SELECT song.id, song.name, song.length, IF(song_favorite.song is null, 0, 1) as favorite, user.id as artist_id, user.artistic_name as artistic_name, album.id AS albumid, album.name AS album, album.artwork
        FROM song
        INNER JOIN album
          ON album.id = song.album

        INNER JOIN song_artist
          ON song_artist.song = song.id

        INNER JOIN user
          ON user.id = song_artist.artist

        LEFT JOIN song_favorite
          ON song_favorite.song = song.id AND song_favorite.user = $user

        WHERE song.album = $album AND song.enabled = 1"
      )
      ->fetch_all(MYSQLI_ASSOC);

    return Album::merge_album_data(Artists::merge_artists($result));
  }

  /**
   * Retorna as musicas nas quais o artista aparece
   * @return array
   */
  public static function get_artist_songs($user, $artist) {
    $result = self::$connection
      ->query("SELECT song.id, song.name, song.length, IF(song_favorite.song is null, 0, 1) as favorite, user.id as artist_id, user.artistic_name as artistic_name, album.id AS albumid, album.name AS album, album.artwork
        FROM (
          SELECT * FROM song WHERE enabled = 1 AND id IN (SELECT song FROM song_artist WHERE artist = $artist) ORDER BY created_at DESC LIMIT 10
        ) AS song
        INNER JOIN album
          ON album.id = song.album
        
        INNER JOIN song_artist
          ON song_artist.song = song.id
        
        INNER JOIN user
          ON user.id = song_artist.artist
        
        LEFT JOIN song_favorite
          ON song_favorite.song = song.id AND song_favorite.user = $user"
      )
      ->fetch_all(MYSQLI_ASSOC);
    
    return Album::merge_album_data(Artists::merge_artists($result));

  }

  /**
   * Procura a musica por match
   * @param string $term
   * @param int    $limit
   * @return array
   */
  public static function search_song_by_match($user, $term, $limit = 10) {
    $result = self::$connection
      ->query("SELECT song.id, song.name, song.length, IF(song_favorite.song is null, 0, 1) as favorite, user.id as artist_id, user.artistic_name as artistic_name, album.id AS albumid, album.name AS album, album.artwork
        FROM song
        INNER JOIN album
          ON album.id = song.album

        INNER JOIN song_artist
          ON song_artist.song = song.id

        INNER JOIN user
          ON user.id = song_artist.artist

        LEFT JOIN song_favorite
          ON song_favorite.song = song.id AND song_favorite.user = $user
        
        WHERE MATCH(`song`.`name`) AGAINST('{$term}' IN BOOLEAN MODE) AND song.enabled = 1"
      )
      ->fetch_all(MYSQLI_ASSOC);

    return Album::merge_album_data(Artists::merge_artists($result));
  }

  /**
   * Retorna todas as musicas de um determinado dono
   * @param int $owner
   * @param int $limit
   * @param int $skip
   * @return array
   */
  public static function get_dashboard_songs_from_owner($owner, $limit = 0, $skip = 0) {
    $result = self::$connection
      ->query("SELECT song.id, song.name, song.length, album.name AS album, user.id as artist_id, user.artistic_name as artistic_name, song.enabled
        FROM song
        INNER JOIN album
          ON album.id = song.album

        INNER JOIN song_artist
          ON song_artist.song = song.id

        INNER JOIN user
          ON user.id = song_artist.artist

        WHERE song.owner = $owner" . pagination($limit, $skip)
      )
      ->fetch_all(MYSQLI_ASSOC);
      
    return Artists::merge_artists($result);
  }

  /**
   * @return array
   */
  public static function get_song_from_owner($owner) {
    $result = self::$connection
      ->query("SELECT song.id, song.name, song.length, user.id as artist_id, user.artistic_name as artistic_name, album.artwork
        FROM song
        INNER JOIN album
          ON album.id = song.album

        INNER JOIN song_artist
          ON song_artist.song = song.id

        INNER JOIN user
          ON user.id = song_artist.artist
          
        WHERE song.owner = $owner AND song.enabled = 1" . pagination(10)
      )
      ->fetch_all(MYSQLI_ASSOC);

    return Album::merge_album_data(Artists::merge_artists($result));
  }

  /**
   * Habilita ou desabilita a musica
   * @param int $owner
   * @param int $id
   * @param int $enabled
   * @return bool
   */
  public static function enable_disable_song($owner, $id, $enable) {
    if (!self::$connection->query("UPDATE song SET enabled = {$enable} WHERE id = {$id} AND owner = {$owner}")) {
      $action = $enable ? 'h' : 'des';
      throw new RouteException("Não foi possível {$action}abilitar a música");
    }

    return (boolean) $enable;
  }

  /**
   * Adiciona a musica na playlist das favoritas
   * @return bool
   */
  public static function favorite_song($user, $song) {
    if (!self::$connection->query("INSERT INTO song_favorite (user, song) SELECT $user, $song WHERE NOT EXISTS (SELECT user FROM song_favorite WHERE user = $user AND song = $song)"))
      throw new RouteException("Não foi possível favoritar a música");

    return true;
  }

  /**
   * Remove a musica na playlist das favoritas
   * @return bool
   */
  public static function remove_song_from_favorite($user, $song) {
    if (!self::$connection->query("DELETE FROM song_favorite WHERE user = $user AND song = $song"))
      throw new RouteException("Não foi possível remover a música das favoritas");

    return false;
  }
}

Songs::__constructStatic();
<?php

include_once __DIR__ . '/artists.php';

class Album {

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
   * Checa se o album existe ou não
   */
  public static function check_if_album_exists($album, $owner) {
    return self::$connection->query("SELECT id FROM album WHERE id = $album AND owner = $owner LIMIT 1")->num_rows === 1;
  }

  /**
   * Retorna a artwork do album informado
   * @param int $id
   * @return string
   */
  public static function get_current_album_artwork($id) {
    return self::$connection->query("SELECT artwork FROM album WHERE id = $id")->fetch_all(MYSQLI_ASSOC)[0]['artwork'];
  }

  /**
   * Cria um novo album
   * @param int $owner
   * @param string $name
   * @param string $type
   * @param string $released
   * @param array $artists
   * @param string $artwork
   */
  public static function create_album($owner, $name, $type, $released, $artists, $artwork) {
    if (!in_array($owner, $artists))
      array_unshift($artists, $owner);

    if (!self::$connection->query("INSERT INTO album (owner, name, type, artwork, released) values ($owner, '$name', '$type', '$artwork', '$released')"))
      throw new RouteException("Não foi possível criar o album");

    if (!Artists::insert_artists_into_album(self::$connection->insert_id, $artists))
      throw new RouteException("Não foi possivel inserir os artistas no album");
  }

  /**
   * Edita o album especificado
   * @param int $owner
   * @param string $name
   * @param string $type
   * @param string $released
   * @param array $artists
   * @param string $artwork
   */
  public static function edit_album($id, $owner, $name, $type, $released, $artists, $artwork) {
    if (!in_array($owner, $artists))
      array_unshift($artists, $owner);

    if (!self::$connection->query("UPDATE album SET owner = $owner, name = '$name', type = '$type', artwork = '$artwork', released = '$released' WHERE id = $id"))
      throw new RouteException("Não foi possível editar o album");

    if (!Artists::update_artists_into_album($id, $artists))
      throw new RouteException("Não foi possivel editar os artistas no album");
  }

  /**
   * Retorna as informações do album com base no id
   * @return array
   */
  public static function get_album($id) {
    $result = self::$connection
      ->query("SELECT album.id, album.name, album.type, album.artwork, album.released, user.id as artist_id, user.artistic_name as artistic_name, user.picture
        FROM album
        INNER JOIN album_artist
          ON album_artist.album = album.id
          
        INNER JOIN user
          ON album_artist.artist = user.id
          
        WHERE album.id = $id AND user.is_artist = 1"
      )
      ->fetch_all(MYSQLI_ASSOC);

    return Artists::merge_artists($result)[0];
  }

  /**
   * Retorna todos os albums de um dono especifico
   * @param int $owner
   * @return @array
   */
  public static function get_albums_from_owner($owner, $include_artwork = false) {
    $fields = [ 'id', 'name' ];
    if ($include_artwork)
      $fields[] = 'artwork';
      
    $fields = join(', ', $fields);
    return self::$connection
      ->query("SELECT $fields FROM album WHERE owner = $owner")
      ->fetch_all(MYSQLI_ASSOC);
  }

  /**
   * Retorna os albums do artista
   * @return array
   */
  public static function get_artist_albums($artist) {
    $results = self::$connection
      ->query("SELECT album.id, album.name, album.type, album.artwork, album.released, user.id AS artist_id, user.artistic_name AS artistic_name
        FROM album
        
        INNER JOIN album_artist
          ON album_artist.album = album.id
        
        INNER JOIN user
          ON album_artist.artist = user.id
        
        WHERE album_artist.album IN (SELECT album FROM album_artist WHERE artist = $artist)"
      )
      ->fetch_all(MYSQLI_ASSOC);

    return Artists::merge_artists($results);
  }

  /**
   * Retorna os albuns onde ele faz alguma participação
   * @return array
   */
  public static function get_albums_artist_appears_on($id) {
    $results = self::$connection
      ->query("SELECT album.id, album.name, album.type, album.artwork, album.released, user.id AS artist_id, user.artistic_name AS artistic_name
        FROM album
        INNER JOIN album_artist
          ON album_artist.album = album.id
        
        INNER JOIN user
          ON album_artist.artist = user.id
        
        WHERE album.id IN (
          SELECT song.album
          FROM song
          INNER JOIN song_artist
            ON song_artist.song = song.id AND song_artist.artist = $id
        
          INNER JOIN album_artist
            ON album_artist.album = song.album
        
          WHERE album_artist.album NOT IN (SELECT album FROM album_artist WHERE artist = $id)
        )"
      )
      ->fetch_all(MYSQLI_ASSOC);

    return Artists::merge_artists($results);
  }

  /**
   * Retorna todos os albums de um dono especifico, porém com todos
   * os artistas
   * @param int $owner
   * @return @array
   */
  public static function get_albums_with_artists_from_owner($owner) {
    $results = self::$connection
      ->query(
        "SELECT album.id, album.name, album.type, album.artwork, album.released, user.id as artist_id, user.artistic_name as artistic_name, user.picture
          FROM album
          INNER JOIN album_artist
            ON album.id = album_artist.album

          INNER JOIN user
            ON album_artist.artist = user.id

          WHERE album.owner = $owner AND user.is_artist = 1")
      ->fetch_all(MYSQLI_ASSOC);

    return Artists::merge_artists($results);
  }

  /**
   * 
   */
  public static function search_album_by_match($term, $limit = 10) {
    $results = self::$connection
      ->query("SELECT album.id, album.name, album.artwork, user.id as artist_id, user.artistic_name as artistic_name
        FROM album
        INNER JOIN album_artist
          ON album.id = album_artist.album

        INNER JOIN user
          ON album_artist.artist = user.id

        WHERE MATCH(`album`.`name`) AGAINST('{$term}' IN BOOLEAN MODE)" . pagination($limit)
      )
      ->fetch_all(MYSQLI_ASSOC);
    
    return Artists::merge_artists($results);
  }

  /**
   * Formata as informações do album num campo separado
   * @param array $results
   * @return array
   */
  public static function merge_album_data($results) {
    return array_map(function ($result) {
      $album = [];
      
      if (isset($result['albumid'])) {
        $album['id'] = $result['albumid'];
      }

      if (isset($result['album'])) {
        $album['name'] = $result['album'];
      }

      if (isset($result['artwork'])) {
        $album['artwork'] = $result['artwork'];
      }

      $result['album'] = $album;
      unset($result['artwork'], $result['albumid']);
      return $result;
    }, $results);
  }
}

Album::__constructStatic();
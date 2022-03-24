<?php

class Artists {

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
   * Obtém o artista por id
   * @param string $term
   * @param int    $limit
   * @return array
   */
  public static function get_artist($id) {
    return self::$connection
      ->query("SELECT id, artistic_name, picture, verified_artist
        FROM user
        WHERE is_artist = 1 AND id = $id"
      )
      ->fetch_all(MYSQLI_ASSOC)[0];
  }

  /**
   * Apaga todos os artiatas do album
   * @param string $album
   * @return boolean
   */
  public static function delete_all_artists_from_album($album) {
    return self::$connection
      ->query("DELETE FROM album_artist WHERE album = $album");
  }
  
  /**
   * Insere os artistas no album informado
   * @param string $album
   * @param array  $artists
   * @return boolean
   */
  public static function insert_artists_into_album($album, $artists) {
    $artists = join(", ", array_map(function ($artist) use ($album) {
      return "($album, $artist)";
    }, $artists));
    
    return self::$connection->query("INSERT INTO album_artist (album, artist) VALUES {$artists}");
  }

  /**
   * Atualiza os artistas do album, pra não ter que ficar checando
   * o que deve ser deletado, o que deve ser mantido e o que deve ser
   * inserido, deleta tudo e re-insere
   * @param string $album
   * @param array  $artists
   * @return boolean
   */
  public static function update_artists_into_album($album, $artists) {
    if (!self::delete_all_artists_from_album($album))
      throw new RouteException("Não foi editar os artistas do album");

    return self::insert_artists_into_album($album, $artists);
  }

    /**
   * Apaga todos os artiatas da musica
   * @param string $song
   * @return boolean
   */
  public static function delete_all_artists_from_song($song) {
    return self::$connection
      ->query("DELETE FROM song_artist WHERE song = $song)");
  }

  /**
   * Insere os artistas na musica informado
   * @param string $song
   * @param array  $artists
   * @return boolean
   */
  public static function insert_artists_into_song($song, $artists) {
    $artists = join(", ", array_map(function ($artist) use ($song) {
      return "($song, $artist)";
    }, $artists));
    
    return self::$connection->query("INSERT INTO song_artist (song, artist) VALUES {$artists}");
  }

  /**
   * Atualiza os artistas da musica, pra não ter que ficar checando
   * o que deve ser deletado, o que deve ser mantido e o que deve ser
   * inserido, deleta tudo e re-insere
   * @param string $song
   * @param array  $artists
   * @return boolean
   */
  public static function update_artists_into_song($song, $artists) {
    if (!self::delete_all_artists_from_song($song))
      throw new RouteException("Não foi editar os artistas da musica");

    return self::insert_artists_into_song($song, $artists);
  }

  /**
   * Procura por artistas
   * @param string $term
   * @param int    $limit
   * @return array
   */
  public static function search_artists($term, $limit) {
    return self::$connection
      ->query("SELECT id, artistic_name, picture
        FROM user
        WHERE is_artist = 1 AND LOWER(artistic_name) LIKE '%$term%'" . pagination($limit)
      )
      ->fetch_all(MYSQLI_ASSOC);
  }

  /**
   * Procura por artistas usando match, ja que a busca pode ter mais que apenas
   * o artista
   * @param string $term
   * @param int    $limit
   * @return array
   */
  public static function search_artists_by_match($term, $limit = 10) {
    return self::$connection
      ->query("SELECT id, artistic_name, picture
        FROM user
        WHERE is_artist = 1 AND MATCH(`artistic_name`) AGAINST ('{$term}' IN BOOLEAN MODE)" . pagination($limit)
      )
      ->fetch_all(MYSQLI_ASSOC);
  }

  /**
   * Dado um array de objeto, contendo neles o campo artista
   * então juntamos todos os artistas em um unico objeto
   * @param array $arr
   * @return array
   */
  public static function merge_artists($arr) {
    $artist_fields = [
      [ 'artist_id', 'id' ],
      [ 'artistic_name', 'artistic_name' ],
      [ 'picture', 'picture' ]
    ];
    
    $return = array_reduce($arr, function ($groups, $element) use ($artist_fields) {
      $artist = [];

      foreach ($artist_fields as $field) {
        if (array_key_exists($field[0], $element))
          $artist[$field[1]] = $element[$field[0]];
        
        unset($element[$field[0]]);
      }
      
      if (array_key_exists($element['id'], $groups)) {
        $groups[$element['id']]['artists'][] = $artist;
      } else {
        $element['artists'] = [ $artist ];
        $groups[$element['id']] = $element;
      }

      return $groups;
    }, []);

    return array_values($return);
  }
}

Artists::__constructStatic();
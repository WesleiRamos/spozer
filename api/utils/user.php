<?php

session_start();
include_once __DIR__ . '/connection.php';

class User {
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
   * Redireciona o usuário para algum lugar
   * @param string $path
   */
  public static function redirect_to($path) {
    header("Location: $path"); exit;
  }

  /**
   * Retorna uma variavel da sessão, caso não exista, retorna null
   * @param string $key
   * @return mixed
   */
  public static function get_session_key($key, $default = null) {
    return isset($_SESSION[$key]) ? $_SESSION[$key] : $default;
  }

  /**
   * Retorna uma variavel passada pelo método post, caso o tipo
   * for checkbox então retornamos um bool
   * @param string $name
   * @param string $type
   * @return mixed
   */
  private static function get_post_variable($name, $type = '') {
    if ($type === 'checkbox') {
      $value = false;
      if (isset($_POST[$name]) && trim($_POST[$name]) === 'on')
        $value = true;
        
      return $value;
    }

    if (isset($_POST[$name]))
      $_POST[$name] = trim($_POST[$name]);
      if (is_numeric($_POST[$name]))
        return (int) $_POST[$name];

      return self::$connection->real_escape_string($_POST[$name]);

    return null;
  }

  /**
   * Checa se existe uma conta associada ao email especificaso
   * @param string $email
   * @return bool
   */
  private static function check_if_account_exists($email) {
    return self::$connection->query("SELECT id FROM user WHERE email = '$email' LIMIT 1")->num_rows === 1;
  }

  /**
   * Função auxiliar que gera a query para o registro do usuário
   * @param string $email
   * @param string $password
   * @param string $firstname
   * @param string $lastname
   * @param string $is_artist
   * @param string $artistic_name
   * @return string
   */
  private static function generate_register_query($email, $password, $firstname, $lastname, $is_artist, $artistic_name) {
    $fields = [ 'email', 'password', 'firstname', 'lastname' ];
    $values = [ $email, $password, $firstname, $lastname ];

    if ($is_artist) {
      array_push($fields, 'is_artist', 'artistic_name');
      array_push($values, 1, $artistic_name);
    }

    $fields = join(', ', $fields);
    $values = join(', ', array_map(function ($value) { return is_string($value) ? "'$value'" : $value; }, $values));

    return "INSERT INTO user ($fields) VALUES ($values)";
  }

  /**
   * Cadastra um usuário
   * @return array
   */
  public static function register_user() {
    $email = User::get_post_variable('email');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL))
      return [ 412, 'Email informado é inválido' ];

    $password = User::get_post_variable('password');
    if (strlen($password) <= 5)
      return [ 412, 'A senha deve ter no mínimo 6 caracteres' ];

    $firstname = User::get_post_variable('firstname');
    if (strlen($firstname) <= 1)
      return [ 412, 'O nome deve ter no mínimo 2 caracteres' ];

    $lastname = User::get_post_variable('lastname');
    if (strlen($lastname) <= 1)
      return [ 412, 'O sobrenome deve ter no mínimo 2 caracteres' ];

    $is_artist = User::get_post_variable('is_artist', 'checkbox');
    $artistic_name = User::get_post_variable('artistic_name');
    if ($is_artist) {
      if (strlen($artistic_name) <= 1)
        return [ 412, 'O nome artístico deve ter no mínimo 2 caracteres' ];
    }

    if (self::check_if_account_exists($email))
      return [ 409, 'Já existe uma conta associada a este email' ];

    $password = password_hash($password, PASSWORD_BCRYPT, [ 'cost' => 12 ]);
    if (!self::$connection->query(self::generate_register_query($email, $password, $firstname, $lastname, $is_artist, $artistic_name)))
      return [ 500, 'Houve um erro interno e não foi possível concluir o cadastro, por favor tente novamente mais tarde' ];

    return [ 200, '/login' ];
  }

  /**
   * Retorna as informações do usuário
   * @param string $email
   * @return array
   */
  private static function get_user_data($email) {
    return self::$connection
      ->query("SELECT * FROM user WHERE email = '$email'")
      ->fetch_all(MYSQLI_ASSOC);
  }

  /**
   * Verifica as informações do usuário
   * @return array
   */
  public static function login_user() {
    $email = User::get_post_variable('email');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL))
      return [ 412, 'Email informado é inválido' ];

    $user_data = self::get_user_data($email);
    if (count($user_data) === 0)
      return [ 412, 'Não existe nenhuma conta associada a este email' ];

    $password = User::get_post_variable('password');
    if (strlen($password) <= 5)
      return [ 412, 'A senha deve ter no mínimo 6 caracteres' ];

    $user_data = $user_data[0];
    if (!password_verify($password, $user_data['password']))
      return [ 401, 'Email ou senha inválidos' ];

    $_SESSION['logout_token'] = guidv4();
    self::save_session_vars($user_data);
    return [ 200, isset($_GET['redirect']) ? urldecode(trim($_GET['redirect'])) : '/' ];
  }

  /**
   * Altera a foto de perfil do usuário
   * @param string $picture
   * @return array
   */
  public static function change_profile_picture($picture) {
    $userid = self::get_user_id();
    if (!self::$connection->query("UPDATE user SET picture = '$picture' WHERE id = $userid"))
      throw new RouteException("Não foi possível atualizar a foto de perfil");

    $current_picture = self::get_user_picture_id();
    if (strlen($current_picture) === 32)
      File::delete_picture($current_picture);

    return self::save_session_vars([ 'picture' => $picture ]);
  }

  /**
   * Salva as informações do usuário em session como cache
   */
  private static function save_session_vars($user_data) {
    foreach ($user_data as $key => $value) {
      if ($key !== 'password') {
        $_SESSION[$key] = $value;
      }
    }

    return $user_data;
  }

  /**
   * O usuário está logado?
   * @return boolean
   */
  public static function is_logged_in() {
    return isset($_SESSION['id']);
  }

  /**
   * Se está logado, redirecionamos para home
   */
  public static function if_logged_redirect_home() {
    if (self::is_logged_in())
      self::redirect_to('/');
  }

  /**
   * Se não está logado, redirecionamos ao login
   */
  public static function if_not_logged_redirect_login() {
    if (!self::is_logged_in()) {
      $redirect    = '';
      $request_uri = trim($_SERVER['REQUEST_URI']);
      if (strlen($request_uri) >= 2) {
        $redirect = '?redirect=' . urlencode($request_uri);
      }

      self::redirect_to("/login$redirect");
    }
  }

  /**
   * Executa uma ação caso o usuário não esteja logado, se estiver
   * ignora
   */
  public static function is_user_authorized() {
    if (!self::is_logged_in()) {
      header('HTTP/1.1 401 Unauthorized');
      echo json_encode([ 'error' => 'Usuário não logado' ]);
      exit;
    }
  }

  /**
   * Remove a sessão do usuário
   */
  public static function logout_user($token) {
    if ($token === self::get_session_key('logout_token')) {
      session_destroy();
      self::redirect_to('/login');
    }
  }

  /**
   * Retorna o user id do usuário
   * @return int
   */
  public static function get_user_id() {
    return self::get_session_key('id');
  }
  
  /**
   * O usuário é ou não um artista?
   * @return boolean
   */
  public static function get_user_artistic_state() {
    return self::get_session_key('is_artist') === '1' ? true : false;
  }

  /**
   * Retorna o nome artistico do usuário
   * @return boolean
   */
  public static function get_user_artistic_name() {
    return self::get_session_key('artistic_name');
  }

  /**
   * Qual é a token de logout do usuário?
   * @return string
   */
  public static function get_user_logout_token() {
    return self::get_session_key('logout_token', '');
  }

  /**
   * Qual é o id da foto do usuario
   * @return string
   */
  public static function get_user_picture_id() {
    return self::get_session_key('picture');
  }

  /**
   * Primeiro nome do usuário
   * @return string
   */
  public static function get_user_firstname() {
    return self::get_session_key('firstname');
  }

  /**
   * Ultimo nome do usuário
   * @return string
   */
  public static function get_user_lastname() {
    return self::get_session_key('lastname');
  }

  /**
   * Retorna a data de criação da conta
   * @return string
   */
  public static function account_create_date() {
    return self::get_session_key('created_at');
  }

  /**
   * Retorna um array com as informações do usuário
   * @return string
   */
  public static function get_data() {
    return [
      'id' => self::get_user_id(),
      'firstname' => self::get_user_firstname(),
      'lastname' => self::get_user_lastname(),
      'picture' => self::get_user_picture_id(),
      'isArtist' => self::get_user_artistic_state(),
      'artisticName' => self::get_user_artistic_name(),
      'memberSince' => self::account_create_date(),
      'token' => self::get_user_logout_token(),
    ];
  }

  /**
   * Retorna os dados do usuário em json
   * @return string
   */
  public static function to_json() {
    return json_encode(self::get_data());
  }
}

User::__constructStatic();
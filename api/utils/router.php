<?php

class RouteException extends Exception {
  private $status = 500;

  /**
   * Classe responsável por informar erro e o status do que aconteceu
   * com a requisição
   */
  public function __construct($message, $status = 500) {
    parent::__construct($message);
    $this->status = $status;
  }

  /**
   * Retorna o status code do erro
   * @return int
   */
  public function getStatus() {
    return $this->status;
  }

  /**
   * Retorna uma string json com base no erro
   * @return string
   */
  public function toJson() {
    return json_encode([ 'error' => $this->message ]);
  }
}

/**
 * Função que ajudara criar rotas conforme o tipo de requisição
 */
class Router {
  private static $method = null;
  private static $routes = [];
  private static $status = 200;
  private static $variables = [];

  /**
   * @var mysqli
   */
  private static $connection = null;

  /**
   * "Construtor" da classe
   */
  public static function __constructStatic() {
    global $connection;
    self::$connection = $connection;
    self::$method = strtolower($_SERVER['REQUEST_METHOD']);
    self::$variables = self::get_request_variables();
  }

  /**
   * Retorna os dados passados na requisição, caso o método seja put as informações
   * serão passadas por json, ja que o php não oferece suporte nativo para ele
   * @return array;
   */
  private static function get_request_variables() {
    switch (self::$method) {
      case 'get':
        return $_GET;

      case 'post':
        return $_POST;

      case 'put':
        return json_decode(file_get_contents('php://input'), true);

      default:
        return [];
    }
  }

  /**
   * Altera o status da requisição
   * @param int $status
   */
  public static function status($status = 200) {
    self::$status = $status;
  }

  /**
   * Adiciona a função informada ao array
   * @param mixed  $callback
   * @param string $file
   * @param string $mustBe   A rota atual deve ser de que método
   */
  private static function add_route($callback, $file, $mustBe) {
    if (self::$method !== $mustBe)
      return;

    self::$routes[self::$method][] = is_callable($callback) ? $callback : [ $file, $callback ];
  }

  /**
   * Adiciona uma função que deve ser executada quando a requisição
   * for do tipo get, aceita tanto uma função quanto um nome de uma função
   * e o arquivo onde a função está
   * @param mixed  $callback
   * @param string $file
   */
  public static function get($callback, $file = null) {
    self::add_route($callback, $file, 'get');
  }

  /**
   * Adiciona uma função que deve ser executada quando a requisição
   * for do tipo post, aceita tanto uma função quanto um nome de uma função
   * e o arquivo onde a função está
   * @param mixed  $callback
   * @param string $file
   */
  public static function post($callback, $file = null) {
    self::add_route($callback, $file, 'post');
  }

  /**
   * Adiciona uma função que deve ser executada quando a requisição
   * for do tipo put, aceita tanto uma função quanto um nome de uma função
   * e o arquivo onde a função está
   * @param mixed  $callback
   * @param string $file
   */
  public static function put($callback, $file = null) {
    self::add_route($callback, $file, 'put');
  }

  /**
   * Extrai um valor de um objeto, caso não exista retorna o valor padrão,
   * se não for informado nenhum valor padrão e o valor não existe, então
   * retornanos um erro
   * 
   * @param string $key
   * @param mixed  $value
   * @return mixed
   */
  public static function from($key, $value = null) {
    if (isset(self::$variables[$key])) {
      $value = self::$variables[$key];

    } else {
      if (isset($_FILES[$key])) {
        $value = $_FILES[$key];
        
      } else {
        if ($value === null)
          throw new RouteException("Campo '{$key}' deve ser informado", 400);
      }
    }

    if (is_string($value)) {
      $value = self::$connection->real_escape_string($value);

      if ($value === 'true' || $value === 'false')
        $value = $value === 'true' ? true : false;
    }

    if (is_numeric($value)) {
      $value = intval($value);
    }
      
    return $value;
  }

  /**
   * Executa as rotas com base no tipo de requisição, se a função retornar alguma coisa então
   * convertemos pra json e retornamos, se um erro for lançado, retornamos o erro e seu status
   */
  public static function exec_router() {
    if (!isset(self::$routes[self::$method]))
      return;

    try {
      foreach (self::$routes[self::$method] as $callback) {
        if (is_callable($callback)) {
          $return = call_user_func($callback, __CLASS__, self::$connection);
        } else {
          include_once($callback[0]);
          $return = call_user_func($callback[1], __CLASS__, self::$connection);
        }

        if ($return !== null) {
          if (!is_array($return))
            $return = [ $return ];
            
          $return = [ 'result' => $return ];
          echo json_encode(format_values($return));
        }
      }
    } catch (RouteException $e) {
      self::status($e->getStatus());
      echo $e->toJson();
    }

    if (self::$status !== 200) {
      header("HTTP/1.1 " . self::$status);
    }
  }
}

Router::__constructStatic();
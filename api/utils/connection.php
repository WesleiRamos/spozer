<?php

/**
 * Retorna código sql para paginação, no qual só aplica caso
 * exista um limite
 * 
 * @param int $skip
 * @param int $limit
 * @return string
 */
function pagination($limit, $skip = 0) {
  return $limit > 0 ? " LIMIT {$limit} OFFSET {$skip}" : "";
}

/**
 * Conexão com o banco de dados
 * @return mysqli
 */
function mysql_connect() {
  $server   = 'localhost';
  $username = 'root';
  $password = '';
  $database = 'spozer';
  $connection = new mysqli($server, $username, $password, $database);

  if ($connection->connect_error) {
    header('HTTP/1.1 500');
    exit(0);
  }

  return $connection;
}

$connection = mysql_connect();
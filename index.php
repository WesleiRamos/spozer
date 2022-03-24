<?php
define('UTILS_PATH', __DIR__ . '/api/utils');
include_once UTILS_PATH . '/user.php';

/**
 * Se não está logado redirecionamos ao inicio
 */
User::if_not_logged_redirect_login(); 

include_once UTILS_PATH. '/functions.php';
include_once UTILS_PATH. '/playlist.php';
include_once UTILS_PATH. '/songs.php';

/**
 * Retorna as informações do usuário
 * @return string
 */
function get_user_data() {
  return json_encode([
    'DATA' => User::get_data(),
    'FEATURED' => Songs::featured_songs(),
    'PLAYLISTS' => Playlist::get_user_playlists(User::get_user_id()),
    'RECOMMENDED' => Songs::recommended_songs(User::get_user_id())
  ]);
}
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
  <base href="/">
  <title>Spozer</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="public/assets/images/icon.png">
  <link rel="stylesheet" href="public/assets/css/index.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.1/vue.global.js"></script>
  <script src="https://unpkg.com/range-slider-element@latest"></script>
  <script src="public/assets/js/global.js"></script>
  <script src="public/assets/js/api.js"></script>
<?php if (User::get_user_artistic_state()): ?>
  <script src="public/assets/js/dashboard.js"></script>
<?php endif;?>
  <script>const USER = Vue.reactive(<?= get_user_data() ?>);</script>
  <script src="public/assets/js/index.js" type="module" defer></script>
</head>
<body>
  <div class="spozer">

    <template v-if="showProgressBar">
      <div class="progress-bar" ></div>
    </template>

    <template v-if="playlist.create">
      <create-edit-playlist :close="() => playlist.create = false"></create-edit-playlist>
    </template>

    <template v-if="showError">
      <div class="display-error">
        <div class="error">
          <span>{{ error.status }}</span> {{ error.message }}.
        </div>
      </div>
    </template>

    <div class="app-menu">
      <ul>
        <li class="logo" @click="goTo('/', 'Início')"></li>
        <li @click="goTo('/', 'Início')"><i class="material-icons">home</i> Início</li>
<?php if (User::get_user_artistic_state()): ?>
        <li @click="goTo('/dashboard', 'Dashboard')"><i class="material-icons">dashboard</i> Dashboard</li>
<?php endif; ?>
        <li @click="goTo('/favorites', 'Músicas favoritas')"><i class="material-icons">favorite</i> Músicas favoritas</li>
        <li @click="() => playlist.create = true"><i class="material-icons">playlist_add</i> Criar playlist</li>
      </ul>

      <ul class="submenu">
        <li class="line"></li>
        <li v-for="playlist in playlist.list" @click="goToPlaylist(playlist)">{{ playlist.name }}</li>
      </ul>
    </div>

    <div class="content">
      <div class="toolbar">
        <div class="search-box">
          <i class="material-icons">search</i>
          <input type="text" v-model="search.term" placeholder="O que você quer ouvir?">
        </div>

        <div class="tools">
          <i class="material-icons">settings</i>
          <a href="/logout?token=<?= User::get_user_logout_token() ?>" class="material-icons" title="Sair">logout</a>
          <img class="picture" @click="goTo('/user', 'Perfil')" :src="profilePicture">
        </div>
      </div>

      <component :is="currentPage" v-bind="currentPageProps"></component>
    </div>

    <song-player :find-lyrics="getLyrics"></song-player>
  </div>
</body>
</html>
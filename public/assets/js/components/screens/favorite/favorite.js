const template = `
<div class="playlist-information">
  <div class="artwork">
    <div class="material-icons icon">
      favorite
    </div>
  </div>

  <div class="information">
    <div class="playlist-name">
      Músicas Favoritas
    </div>

    <div class="details">
      <span>{{ songCount }}</span>
      <span v-if="totalDuration">{{ totalDuration }}</span>
    </div>
  </div>
</div>

<div class="album-song-header">
  <div class="song-list">
    <div class="song favorite">
      <span>#</span>
      <span></span>
      <span>Título</span>
      <span>Artistas</span>
      <span>Album</span>
      <span>Adicionado em</span>
      <span>Dur.</span>
      <span></span>
    </div>
  </div>
</div>

<template v-if="!isLoading && canDisplay">
  <song-list title="" className="favorite" :songs="songs"></song-list>
</template>`

export default {
  name: 'favorite-songs',
  component: {
    template,

    data: () => ({
      isLoading: true,
      songs: []
    }),

    computed: {
      /**
       * Tem dados para mostrar o album?
       * @returns {Boolean}
       */
      canDisplay() {
        return this.songs.length
      },

      /**
       * Quantidade de musicas no album
       * @returns {String}
       */
      songCount() {
        return `${this.songs.length} ${this.songs.length === 1 ? 'música' : 'músicas'}`
      },

      /**
       * Calcula o tempo total de musica no album
       * @returns {String}
       */
      totalDuration() {
        const duration = this.songs.reduce((acc, { length }) => acc + length, 0)
        return [
          this.formatOrZero(duration / 3600, 'hrs'),
          this.formatOrZero((duration % 3600) / 60, 'min')
        ]
        .filter(Boolean)
        .join(' ')
      }
    },

    created() {
      this.loadFavoriteSongs()
    },

    methods: {
      /**
       * Formata o valor ou retorna 0
       * @param {Number} value 
       * @param {String} str 
       * @returns {String|Number}
       */
      formatOrZero(value, str) {
        return void(value = Math.floor(value)) || value <= 0 ? 0 : `${value} ${str}`
      },
      
      /**
       * Carrega as informações do album
       */
      async loadFavoriteSongs() {
        this.songs = await api.getFavoriteSongs()
        this.isLoading = false
      },

      goToArtist(id, artistic_name) {
        goToArtistPage(id, artistic_name)
      }
    }
  }
}
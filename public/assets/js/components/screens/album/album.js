const template = `
<template v-if="!isLoading && canDisplay">
  <div class="album-information">
    <div class="album-artwork">
      <img :src="artwork">
    </div>

    <div class="information">
      <div class="album-name">
        {{ name }}
      </div>

      <div class="album-artists">
        <div class="artists-pictures">
          <template v-for="artist in album.artists">
            <div class="artist-picture" @click="goToArtist(artist.id, artist.artistic_name)" :data-artist-name="artist.artistic_name">
              <img :src="getPicture(artist)">
            </div>
          </template>
        </div>
      </div>

      <div class="album-details">
        <span>{{ albumType }}</span>
        <span>{{ songCount }}</span>
        <span>{{ totalDuration }}</span>
        <span>{{ released }} </span>
      </div>
    </div>
  </div>

  <div class="album-song-header">
    <div class="song-list">
      <div class="song album">
        <span>#</span>
        <span></span>
        <span>Título</span>
        <span>Artistas</span>
        <span>Dur.</span>
        <span></span>
      </div>
    </div>
  </div>

  <song-list title="" className="album" :songs="songs"></song-list>
</template>`

export default {
  name: 'album',
  component: {
    template,

    props: {
      id: {
        type: [ String, Number ],
        default: 0
      }
    },

    data: () => ({
      isLoading: true,
      album: null,
      songs: []
    }),

    computed: {
      /**
       * Tem dados para mostrar o album?
       * @returns {Boolean}
       */
      canDisplay() {
        return this.album != null && this.songs.length
      },

      /**
       * Nome do album
       * @returns {String}
       */
      name() {
        return this.album.name
      },

      /**
       * URL da artwork do album
       * @returns {String}
       */
      artwork() {
        return !this.album.artwork ? '' : Media.artworkURL(this.album.artwork)
      },

      /**
       * Quantidade de musicas no album
       * @returns {String}
       */
      songCount() {
        return `${this.songs.length} ${this.songs.length === 1 ? 'música' : 'músicas'}`
      },

      /**
       * Data de lançamento do album
       * @returns {String}
       */
      released() {
        return new Date(this.album.released).toLocaleDateString()
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
      },

      /**
       * Tipo do album
       * @returns {String}
       */
      albumType() {
        switch (this.album.type) {
          case 'album': return 'Álbum';
          case 'single': return 'Single'
        }
      }
    },

    created() {
      this.loadAlbum()
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
       * Retorna a url da foto do artista
       * @param {{ picture: String }} param0 
       * @returns {String}
       */
      getPicture({ picture }) {
        return Media.pictureURL(picture)
      },

      /**
       * Carrega as informações do album
       */
      async loadAlbum() {
        const { album = null, songs = [] } = await api.getAlbum({ id: this.id })
        this.album = album
        this.songs = songs
        this.isLoading = false
      },

      goToArtist(id, artistic_name) {
        goToArtistPage(id, artistic_name)
      }
    },

    watch: {
      /**
       * Quando o id mudar atualizamos o artista
       */
      id() {
        this.loadAlbum()
      }
    }
  }
}
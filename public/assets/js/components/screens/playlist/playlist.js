const template = `
<div class="playlist-information">
  <div class="artwork" :style="playlistArtworkStyle">
    <template v-if="!songs.length">
      <div class="material-icons icon">
        music_note
      </div>
    </template>
  </div>

  <div class="information">
    <div class="playlist-name">
      {{ playlist.name }}
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
  <song-list title="" className="playlist" :playlist="id" :songs="songs"></song-list>
</template>`

export default {
  name: 'playlist',
  component: {
    template,

    props: {
      id: {
        type: String,
        default: '0'
      }
    },

    data: () => ({
      isLoading: true,
      playlist: {},
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
       * Retorna o estilo para "a imagem" de artworks
       * @returns {{ background: String }}
       */
      playlistArtworkStyle() {
        if (this.songs.length === 0)
          return {}

        const backgrounds = []
        for (let i = 0; i < this.songs.length; i++) {
          const artwork = this.songs[i].album.artwork
          if (!backgrounds.includes(artwork))
            backgrounds.push(artwork)

          if (backgrounds.length === 4)
            break
        }

        if (backgrounds.length <= 3)
          return {
            background: `no-repeat url(${Media.artworkURL(backgrounds[0])})`,
            backgroundSize: 'cover'
          }

        return {
          background: backgrounds.map(artwork => `no-repeat url(${Media.artworkURL(artwork)})`).join(', '),
          backgroundSize: '50%',
          backgroundPosition: '0 0, 100% 0, 0 100%, 100% 100%'
        }
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
      this.loadPlaylistSongs()
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
      async loadPlaylistSongs() {
        const { playlist = {}, songs = [] } = await api.getPlaylistSongs({ playlist: this.id })
        this.songs = songs
        this.playlist = playlist
        this.isLoading = false
      },

      goToArtist(id, artistic_name) {
        goToArtistPage(id, artistic_name)
      }
    },

    watch: {
      /**
       * Id mudou? recarrega
       */
      id() {
        this.loadPlaylistSongs()
      }
    }
  }
}
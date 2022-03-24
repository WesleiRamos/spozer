const template = `
<div style="margin-top: 50px">
  <h2>Recomendadas</h2>
  <p style="font-size: 15px; margin-top: 10px;">
    Os hits que você precisa conhecer
  </p>

  <div class="result-section">
    <div class="result-list">
      <div class="item" v-for="(song, index) in recommended" @click="playSong(index)">
        <div class="item-picture">
          <img :src="getArtwork(song.album)">
        </div>

        <p class="main">
          {{ song.name }}
        </p>
        
        <p class="secondary">por
          <template v-for="artist in song.artists">
            <span class="album-artist" @click.stop="goToArtist(artist.id, artist.artistic_name)">
              {{ artist.artistic_name }}
            </span>
          </template>
        </p>
      </div>
    </div>
  </div>
</div>
`

export default {
  name: 'recommended-songs',
  component: {
    template, 
    computed: {
      /**
       * Retorna as musicas recomendadas
       * @returns {Array}
       */
      recommended() {
        return USER.RECOMMENDED
      }
    },

    methods: {
      /**
       * Emite um evento para que o player mude de musica
       * @param {Number} index 
       */
      playSong(index) {
        globalEvents.dispatchEvent('player:change-song', index, this.recommended)
      },

      /**
       * 
       * @param {{ artwork: String }} param0 
       * @returns {String}
       */
      getArtwork({ artwork }) {
        return Media.artworkURL(artwork)
      },

      goToArtist(id, artistic_name) {
        goToArtistPage(id, artistic_name)
      }
    }
  }
}
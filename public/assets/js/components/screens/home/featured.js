/**
 * @type {Number}
 */
const SONG_CARD_SIZE = 800

/**
 * @type {String}
 */
const template = `
<div class="featured-buttons">
  <div @click="prevFeatured" :style="canPrev">
    <i class="material-icons">chevron_left</i>
  </div>

  <div @click="nextFeatured" :style="canNext">
    <i class="material-icons">chevron_right</i>
  </div>
</div>

<div class="featured" ref="featured">
  <div class="song-card" v-for="(song, index) in featured" @click="playSong(index)" :style="getBackgroundFeatured(song)">
    <div class="name">
      <h2>{{ getSongName(song) }}</h2>
    </div>

    <div class="aaa">
      <div class="album">
        <div>
          <p>Album</p>
          <h2>{{ getAlbumName(song) }}</h2>
        </div>
      </div>

      <div class="artist">
        <div>
          <p>Artista</p>
          <h2>{{ getArtists(song) }}</h2>
        </div>
      </div>
    </div>
  </div> 
</div>`

export default {
  name: 'featured-songs',
  component: {
    template,

    data: () => {
      return {
        canClick: true,
        reachedMax: false,
        reachedMin: true
      }
    },
    
    mounted() {
      this.$refs.featured.scrollLeft = 0 // fix pro godzilla giroflex
    },

    computed: {
      /**
       * Retorna as musicas destaque
       * @returns {Array}
       */
      featured() {
        return USER.FEATURED
      },
    
      /**
       * Retorna o style do botão prev
       * @returns {{ color: String, pointerEvents: String }}
       */
      canPrev() {
        return this.canPrevNext(this.reachedMin)
      },
    
      /**
       * Retorna o style do botão next
       * @returns {{ color: String, pointerEvents: String }}
       */
      canNext() {
        return this.canPrevNext(this.reachedMax)
      }
    },

    methods: {
      /**
       * Retorna o nome da musica informada
       * @param {{ name: String }} param0 
       * @returns {String}
       */
      getSongName({ name }) {
        return name.split('-')[0].trim().split('(')[0].trim()
      },

      /**
       * Retorna o nome do album da música informada
       * @param {{ album: { name: String }}} param0 
       * @returns {String}
       */
      getAlbumName({ album }) {
        return album.name
      },

      /**
       * Retorna os artistas da música informada
       * @param {{ artists: { artistic_name: String }}} param0 
       * @returns {String}
       */
      getArtists({ artists }) {
        return artists.map(({ artistic_name }) => artistic_name).join(', ')
      },

      /**
       * Emite um evento para que o player mude de musica
       * @param {Number} index 
       */
      playSong(index) {
        globalEvents.dispatchEvent('player:change-song', index, this.featured.map(({ background, ...song }) => song))
      },

      /**
       * Retorna CSS para os botoes de prev. e next.
       * @param {Bool} b 
       * @returns {{ color: String, pointerEvents: String }}
       */
      canPrevNext(b) {
        const color = !b ? '#f0f0f0' : 'rgb(90, 90, 90)'
        const pointerEvents = !b ? 'auto' : 'none'
        return { color, pointerEvents }
      },
    
      /**
       * Retorna o CSS para o fundo do card
       * @param {{ background: String }} param0 
       * @returns 
       */
      getBackgroundFeatured({ background }) {
        return {
          background,
          backgroundPosition: 'center top',
          backgroundSize: '400px, 100%',
          backgroundRepeat: 'no-repeat'
        }
      },
    
      /**
       * Carrega os novos itens da lista
       */
      nextFeatured() {
        this.applyScrollMovement(SONG_CARD_SIZE)
      },
    
      /**
       * Carrega os itens anteriores da lista
       */
      prevFeatured() {
        this.applyScrollMovement(-SONG_CARD_SIZE)
      },
    
      /**
       * Aplica o movimento no scroll, caso sobre uma parte pequena a ser movimentada
       * então aplicamos o restante
       * @param {Number} quantity 
       */
      applyScrollMovement(quantity) {
        if (!this.canClick)
          return
        
        this.canClick = false
        const featured = this.$refs.featured
        
        if (quantity > 0) {
          const sum = featured.scrollLeft + featured.offsetWidth + quantity
          if ((featured.scrollWidth - sum) < (SONG_CARD_SIZE / 1.3)) {
            quantity += sum
          }
        } else {
          const sum = featured.scrollLeft + quantity
          if (sum < (SONG_CARD_SIZE / 1.3)) {
            quantity -= featured.scrollLeft + quantity
          }
        }
    
        this.reachedMin = featured.scrollLeft + quantity <= 0
        this.reachedMax = featured.scrollLeft + featured.offsetWidth + quantity >= featured.scrollWidth
    
        featured.scrollLeft += quantity
        setTimeout(() => this.canClick = true, 300)
      }
    }
  }
}

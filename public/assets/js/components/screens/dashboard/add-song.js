const template = `
<div class="form add-song" v-if="!isLoading">
  <form @submit.prevent="createSong">
    <h2 class="title">
      Adicionar música
    </h2>

    <div>
      <label class="placeholder">
        <input type="text" v-model="newsong.name" required>
        <span>Informe um título</span>
      </label>
    </div>

    <div>
      <label class="placeholder">
        <input type="text" list="artists" v-model="datalist.artist" @keyup="artistKeyUp">
        <datalist id="artists">
          <option v-for="artist in datalist.artists" :data-value="artist.id">
            {{ artist.artistic_name }}
          </option>
        </datalist>
        <span>Inserir outros artistas</span>
      </label>

      <div class="artists-chips">
        <div class="chip img" v-for="(artist, index) in newsong.artists">
          <img class="artwork" :src="getPicture(artist)">
          <span>{{ artist.artistic_name }}</span>
          <div class="actions">
            <span @click="removeArtist(index)" title="Remover artista">x</span>
          </div>
        </div>
      </div>
      
      <button class="btn insert" type="button" @click="insertArtist">
        Inserir artista
      </button>
    </div>

    <div>
      <label class="placeholder">
        <select v-model="newsong.album" required>
          <option v-for="album in albumlist" :value="album.id">
            {{ album.name }}
          </option>
        </select>
        <span>Selecionar album</span>
      </label>
    </div>

    <div>
      <label>
        <span>Música</span>
        <input type="file" ref="song" accept=".mp3" required>
        <div class="select-file">Selecionar arquivo</div>
      </label>
    </div>

    <button class="btn">Adicionar música</button>
  </form>
</div>
`


// Apenas pra ajudar na hora de resetar
const defaultDatalist = () => ({
  artist: '',
  artists: [],
  debounce: null,
})

// Mesmo do de cima
const defaultSong = () => ({
  name: '',
  album: -1,
  artists: [ ]
});


export default {
  name: 'add-songs',
  component: {
    template,
    data: () => ({
      isLoading: false,
      albumlist: [],
      newsong: defaultSong(),
      datalist: defaultDatalist(),
    }),

    async created() {
      this.isLoading = true
      this.albumlist = await dashboard.getAlbuns()
      this.isLoading = false
    },

    methods: {
      /**
       * 
       * @param {{ picture: String }} param0 
       * @returns {String}
       */
       getPicture({ picture }) {
        return Media.pictureURL(picture)
      },

      /**
       * Toda vez que o usuário soltar uma tecla tendo foco no campo de texto artistas,
       * cancelamos o timeout e criamos um novo timeout para carregar os artistas com base
       * no termo informado, o timeout tem como função só carregar os artistas quando o 
       * usuário parar de digitar
       */
      async artistKeyUp() {
        clearTimeout(this.debounce)
        const term = this.datalist.artist.toLowerCase()
        this.datalist.artists = await dashboard.getArtists({ term })
      },

      /**
       * Insere um novo artista na lista da nova musica
       */
      insertArtist() {
        const option = document.querySelector('#artists option')

        // Caso por algum motivo não sobrou só option então não da pra
        // recuperar o id do artista
        if (!option) 
          return;
          
        const id = option.dataset.value
        const artistic_name = this.datalist.artist

        this.datalist.artist = ''
        
        // Se já adicionou esse artista antes então ignora
        if (this.newsong.artists.findIndex((a) => a.id === id) >= 0) {
          return this.datalist.artists.length = 0
        }

        const { picture } = this.datalist.artists.find((a) => a.id === id)
        this.newsong.artists.push({ id, artistic_name, picture })
        return this.datalist.artists.length = 0
      },

      /**
       * Remove o artista da lista
       * @param {Number} index 
       */
      removeArtist(index) {
        this.newsong.artists.splice(index, 1)
      },

      /**
       * Retorna as informações da musica a ser inserida
       * @returns {{ name: String, album: Number, artists: Array<Number>, song: Blob }}
       */
      getNewSongData() {
        const [ song ] = this.$refs.song.files
        return { ...this.newsong, artists: this.newsong.artists.map(({ id }) => id), song }
      },

      /**
       * 
       */
      async createSong() {
        this.isLoading = true
        const { ok } = await dashboard.createSong(this.getNewSongData())
        if (ok) {
          this.newsong = defaultSong()
        }
        this.isLoading = false
      }
    }
  }
}
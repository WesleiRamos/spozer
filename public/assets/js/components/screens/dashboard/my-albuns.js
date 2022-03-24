const template = `
<template v-if="!isLoading">
  <div class="my-albuns">
    <div class="tools">
      <button @click="createAlbumModal">
        <i class="material-icons">add</i>
        <span>Criar álbum</span>
      </button>
    </div>

    <div class="table-head">
      <span>Artwork</span>
      <span>Título</span>
      <span>Artista</span>
      <span>Lançado em</span>
      <span></span>
    </div>

    <div class="album" v-for="album in albumlist">
      <img class="artwork" :src="getArtwork(album.artwork)">
      <span>{{ album.name }}</span>
      <div>
        <span class="album-artist" v-for="artist in album.artists">
          {{ artist.artistic_name }}
        </span>
      </div>
      <span>{{ getAlbumReleaseDate(album.released) }}</span>
      <span>
        <i class="material-icons" title="Editar album" style="cursor: pointer" @click="editAlbumModal(album)">
          mode_edit
        </i>
      </span>
    </div>
  </div>

  <div class="modal" v-if="showModal">
    <div class="form modal-content">
      <h2 class="title">
        {{ modal.option === 0 ? 'Criar' : 'Editar' }} Álbum
      </h2>

      <div class="preview" title="Preview artwork">
        <img ref="preview" :src="getArtwork(currentAlbum.artwork)">
      </div>

      <form @submit.prevent="submitModalForm">
        <div>
          <label class="placeholder">
            <input type="text" :disabled="isLoading" v-model="currentAlbum.name" required>
            <span>Insira o título</span>
          </label>
        </div>
        
        <div>
          <label class="placeholder">
            <select :disabled="isLoading" v-model="currentAlbum.type">
              <option value="album" selected>Álbum</option>
              <option value="single">Single</option>
            </select>
            <span>Tipo</span>
          </label>
        </div>

        <div>
          <label class="placeholder">
            <input type="text" list="artists" :disabled="isLoading" v-model="datalist.artist" @keyup="artistKeyUp">
            <datalist id="artists">
              <option v-for="artist in datalist.artists" :data-value="artist.id">
                {{ artist.artistic_name }}
              </option>
            </datalist>
            <span>Inserir outros artistas</span>
          </label>

          <div class="artists-chips">
            <div class="chip img" v-for="(artist, index) in currentAlbum.artists">
              <img class="artwork" :src="getPicture(artist)">
              <span>{{ artist.artistic_name }}</span>
              <div class="actions">
                <span @click="removeArtist(index)" title="Remover artista">x</span>
              </div>
            </div>
          </div>
          
          <button class="btn insert" type="button" :disabled="isLoading" @click="insertArtist">
            Inserir artista
          </button>
        </div>

        <div>
          <label class="placeholder">
            <input type="date" :disabled="isLoading" v-model="currentAlbum.released" required>
            <span>Lançado em</span>
          </label>
        </div>

        <div>
          <label>
            <span>Artwork</span>
            <input type="file" ref="artwork" @change="artworkSelected" accept=".png, .jpg, .jpeg" :disabled="isLoading" :required="!currentAlbum.artwork">
            <div class="select-file">Selecionar arquivo</div>
          </label>
        </div>

        <div>
          <button class="btn" :disabled="isLoading">Criar</button>
          <button class="btn cancel" type="button" @click="closeModal" :disabled="isLoading">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>
`

// Apenas pra ajudar na hora de resetar
const defaultAlbum = () => ({
  id: -1,
  name: '',
  type: 'album',
  artists: [],
  released: new Date().toISOString().slice(0, 10)
})

// Mesmo caso de cima
const defaultDatalist = () => ({
  artist: '',
  artists: [],
  debounce: null,
})

export default {
  name: 'my-albuns',
  component: {
    template,

    data: () => ({
      isLoading: false,

      modal: {
        option: 0,
        show: false
      },

      datalist: defaultDatalist(),

      albumlist: [],

      currentAlbum: defaultAlbum()
    }),

    async created() {
      this.isLoading = true
      this.albumlist = await dashboard.getAlbuns({ artists: 1 })
      this.isLoading = false
    },

    computed: {
      showModal() {
        return this.modal.show
      }
    },

    methods: {
      getAlbumReleaseDate(date) {
        return !date ? '' : date.split('-').reverse().join('/')
      },

      /**
       * 
       * @param {{ picture: String }} param0 
       * @returns {String}
       */
       getPicture({ picture }) {
        return Media.pictureURL(picture)
      },

      /**
       * Retorna a url da artwork
       * @param {String} file 
       * @returns 
       */
      getArtwork(file) {
        if (!file)
          return ''

        return Media.artworkURL(file)
      },

      /**
       * Abre um modal para a criação de album
       */
      createAlbumModal() {
        this.currentAlbum = defaultAlbum()
        this.modal.option = 0
        this.modal.show = true
      },

      /**
       * Abre um modal para a edição do album
       * @param {Object} album 
       */
      editAlbumModal(album) {
        this.currentAlbum = { ...album }
        this.modal.option = 1
        this.modal.show = true
      },

      /**
       * Fecha o modal, reseta o datalist e libera a imagem da memória
       */
      closeModal() {
        this.modal.show = false
        this.datalist = defaultDatalist()
        
        if (this.$refs.preview && this.$refs.preview.src.length)
          window.URL.revokeObjectURL(this.$refs.preview.src)
      },

      /**
       * Toda vez que o usuário soltar uma tecla tendo foco no campo de texto artistas,
       * cancelamos o timeout e criamos um novo timeout para carregar os artistas com base
       * no termo informado, o timeout tem como função só carregar os artistas quando o 
       * usuário parar de digitar
       */
       artistKeyUp() {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(async () => {
          const term = this.datalist.artist.toLowerCase()
          this.datalist.artists = await dashboard.getArtists({ term })
        }, 400)
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
        if (this.currentAlbum.artists.findIndex((a) => a.id === id) >= 0) {
          return this.datalist.artists.length = 0
        }

        const { picture } = this.datalist.artists.find((a) => a.id === id)
        this.currentAlbum.artists.push({ id, artistic_name, picture })
        this.datalist.artists.length = 0
      },

      /**
       * Remove o artista da lista
       * @param {Number} index 
       */
      removeArtist(index) {
        this.currentAlbum.artists.splice(index, 1)
      },

      /**
       * Quando a artwork for selecionada mostra no preview
       */
      artworkSelected() {
        const [ artwork ] = this.$refs.artwork.files
        this.$refs.preview.src = window.URL.createObjectURL(artwork)
      },

      /**
       * Retorna as informações do album que está sendo criado/editado
       */
      getAlbumProperties() {
        let [ artwork ] = this.$refs.artwork.files
        if (artwork === undefined)
          artwork = null
          
        const { id, name, type, artists, released } = this.currentAlbum
        return { id, name, type, released, artwork, artists: artists.map(({ id }) => id) }
      },

      /**
       * Cria/edita o album informado
       */
      async submitModalForm() {
        this.isLoading = true
        const album = this.getAlbumProperties()
      
        // Se o id menor ou igual a 0 criamos um novo album
        // caso contrário editamos o album
        this.albumlist = album.id <= 0
          ? await dashboard.createAlbum(album)
          : await dashboard.editAlbum(album)

        void(this.isLoading = false) || this.closeModal()
      },
    }
  }
}
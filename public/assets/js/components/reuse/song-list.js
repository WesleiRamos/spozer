const template = `
<div class="result-section" v-if="songs.length">
  <template v-if="title.length">
    <div class="title">
      <h2>{{ title }}</h2>
    </div>
  </template>

  <div class="song-list" ref="songlist">
    <div v-for="(song, i) in songList" :class="['song', className]" @click="playSong(i)">

      <div class="icon">
        <template v-if="isAlbum">
          <span class="number">
            {{ i + 1 }}
          </span>
        </template>
        
        <template v-else>
          <img class="artwork" :src="getArtwork(song.album)">
        </template>

        <img class="play-icon" :src="playIcon">
      </div>

      <div :class="animateFavoriteButton(song)" :title="favoriteButtonTiele(song.favorite)" @click.stop="favoriteUnfavoriteSong(song)">
        {{ favoriteIcon(song.favorite) }}
      </div>

      <span>
        {{ song.name }}
      </span>

      <div>
        <span v-for="artist in song.artists" class="album-artist hover" @click.stop="goToArtist(artist.id, artist.artistic_name)">
          {{ artist.artistic_name }}
        </span>
      </div>

      <div class="hover" v-if="!isAlbum" @click.stop="goToAlbum(song.album.id, song.album.name)">
        {{ song.album.name }}
      </div>

      <div v-if="isFavoritePlaylist || this.isPlaylist">
        {{ addedAtDate(song) }}
      </div>

      <span>
        {{ formatTime(song.length) }}
      </span>

      <div class="action" @click.stop="openContextMenu(song)">
        <div class="material-icons action-icon" :title="actionButtonTitle">
          {{ actionIcon }}
        </div>

        <div class="playlist-context-menu" v-if="canShowContextMenu(song)">
          <ul>
            <template v-if="isPlaylist">
              <li @click="removeSongFromPlaylist(song)">
                Remover da playlist
              </li>
            </template>

            <template v-else>
              <li v-for="playlist in playlists" @click.stop="addSongToPlaylist(playlist.id, song.id)">
                {{ playlist.name }}
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <template v-if="this.showOnly > 0 && this.songs.length > this.showOnly">
    <span class="show-more-button" @click="this.showAll = !this.showAll">
      {{ this.showAll ? 'Mostrar menos' : 'Ver mais' }}
    </span>
  </template>
</div>`

export default {
  name: 'song-list',
  component: {
    template,

    props: {
      songs: {
        type: Array,
        default: () => []
      },

      title: {
        type: String,
        default: 'Músicas'
      },

      className: {
        type: String,
        default: ''
      },

      showOnly: {
        type: Number,
        default: 0
      },

      playlist: {
        type: Number,
        default: 0
      }
    },

    data: () => ({
      showAll: false,

      internalSongs: [],

      contextmenu: {
        show: false,
        songid: 0
      },

      favorite: {
        debounces: {},
      },

      playlists: USER.PLAYLISTS
    }),

    computed: {
      /**
       * Retorna as musicas que devem ser mostradas
       * @returns {Array}
       */
      songList() {
        return this.showAll ? this.internalSongs : this.internalSongs.slice(0, this.showOnly)
      },

      /**
       * A tela atual é album?
       * @returns {Boolean}
       */
      isAlbum() {
        return this.className === 'album'
      },

      /**
       * A tela atual é de playlist?
       * @returns {Boolean}
       */
      isPlaylist() {
        return this.className === 'playlist'
      },

      /**
       * É a lista de musicas favoritas?
       * @returns {Boolean}
       */
      isFavoritePlaylist() {
        return this.className === 'favorite'
      },

      /**
       * Retorna a url do icone de tocar
       * @returns {String}
       */
      playIcon() {
        return `${APP_URL}/public/assets/images/icons/Play.png`
      },

      /**
       * Qual icone de ação deve ser exibido na tela
       * @returns {String}
       */
      actionIcon() {
        return this.isPlaylist ? 'remove' : 'add'
      },

      /**
       * Que title devemos mostrar
       * @returns {String}
       */
      actionButtonTitle() {
        return this.isPlaylist ? 'Remover da playlist' : 'Adicionar a playlist'
      }
    },

    /**
     * Quando criado checamos se devemos mostrar todas as musicas ou devemos
     * paginar os resultados
     */
    created() {
      this.showAll = this.showOnly == 0
      this.internalSongs = [ ...this.songs ]
    },

    mounted() {
      document.body.addEventListener('click', this.closeContextMenu)
    },

    beforeUnmount() {
      document.body.removeEventListener('click', this.closeContextMenu)
    },

    methods: {
      /**
       * Mostra o menu de contexto para adicionar a musica à playlist
       */
      openContextMenu(song) {
        this.contextmenu.songid = song.id
        this.contextmenu.show = true
      },

      /**
       * Posso abrir o menu de contexto?
       * @param {{ id: String }} song 
       * @returns {Boolean}
       */
      canShowContextMenu(song) {
        return this.contextmenu.songid === song.id && this.contextmenu.show
      },

      /**
       * Fecha o menu de contexto caso não esteja clicando nele
       * @param {Event} event 
       */
      closeContextMenu(event = null) {
        if (event === null || event.target.offsetParent != this.$refs.contextmenu) {
          this.contextmenu.show = false
          this.contextmenu.songid = 0
        }
      },

      /**
       * Emite um evento para que o player mude de musica
       * @param {Number} index 
       */
      playSong(index) {
        globalEvents.dispatchEvent('player:change-song', index, this.songs.map(({ changed, ...s }) => s))
      },

      /**
       * Retorna a data por extenso da adição da musica
       * @param {{ added_at: Date }} param0 
       * @returns {String}
       */
      addedAtDate({ added_at }) {
        return new Date(added_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' })
      },

      /**
       * 
       * @param {{ artwork: String }} param0 
       * @returns {String}
       */
      getArtwork({ artwork }) {
        return Media.artworkURL(artwork)
      },

      /**
       * 
       * @param {Number} seconds 
       * @returns {String}
       */
      formatTime(seconds) {
        return formatTime(seconds)
      },

      /**
       * O icone de status de favorita da musica
       * @param {Boolean} favorite 
       * @returns {Boolean}
       */
      favoriteIcon(favorite) {
        return favorite ? 'favorite' : 'favorite_border'
      },

      /**
       * Retorna qual texto deve ser exibido ao passar o mouse em cima
       * do botão de fav/desfav
       * @param {Boolean} favorite 
       * @returns {String}
       */
      favoriteButtonTiele(favorite) {
        return favorite
          ? 'Remover dos favoritos'
          : 'Adicionar aos favoritos'
      },

      /**
       * Retorna as classes do botão de favorito, apos o retorno da api
       * animamos o botão
       * @param {{ changed: Boolean | undefined, favorite: Boolean }} song 
       * @returns {Array<String>}
       */
      animateFavoriteButton({ changed, favorite }) {
        const classes = [ 'material-icons', 'favorite', { 'fav': favorite } ]
        if (changed === undefined)
          return classes

        return [ ...classes, favorite ? 'fav-anim' : 'unfav-anim' ]
      },

      /**
       * Favorita ou desfavorita a musica, ajuda a evitar cliques acidentais na 
       * playlist de musicas favoritas
       * 
       * @param {{ id: Number, favorite: Boolean }} song 
       */
      favoriteUnfavoriteSong(song) {
        clearTimeout(this.favorite.debounces[song.id])

        // Se é a playlist das favoritas, estou favoritando uma musica e o timer ainda não foi
        // executado, então só deletamos ele da lista
        const action = song.favorite = song.changed = !song.favorite
        if (this.isFavoritePlaylist && action && this.favorite.debounces[song.id] !== null) {
          return this.favorite.debounces[song.id] = null
        }

        // Se não é a playlist de musicas favoritas, então não há uma necessidade
        // de aguardar o usuário corrigir clicando novamente, caso contrário
        // definimos um timer, se favoritou é imediato e caso está removendo, demora
        // 2 segundos para que o usuário possa clicar novamente e cancelar essa ação
        const interval = !this.isFavoritePlaylist
          ? 0
          : (action ? 0 : 2000) 

        this.favorite.debounces[song.id] = setTimeout(async () => {
          const { value } = await api.favoriteSong({ action, id: song.id })
          
          // Se é a playlist de musicas favoritas,
          // então removemos da lista
          if (this.isFavoritePlaylist && !value){
            this.internalSongs = this.internalSongs.filter(({ id }) => song.id != id)
          }

          song.favorite = song.changed = value
          this.favorite.debounces[song.id] = null
          await Database.updateFavQueue(song.id, value)
        }, interval)
      },

      /**
       * Adiciona a música na playlist
       * @param {Number} playlist
       * @param {Number} song 
       */
      async addSongToPlaylist(playlist, song) {
        this.closeContextMenu()
        await api.insertPlaylistSong({ playlist, song })
      },

      /**
       * Adiciona a música na playlist
       * @param {{ id: Number, pid: Number }} song 
       */
      async removeSongFromPlaylist(song) {
        this.closeContextMenu()
        await api.removePlaylistSong({ playlist: this.playlist, song: song.pid })
        this.internalSongs = this.internalSongs.filter(({ id }) => song.id != id)
      },

      goToAlbum(id, album_name) {
        goToAlbumPage(id, album_name)
      },

      goToArtist(id, artistic_name) {
        goToArtistPage(id, artistic_name)
      }
    },

    watch: {
      /**
       * As musicas mudaram? então troca
       * @param {Array} newval 
       */
      songs(newval) {
        this.internalSongs = newval
      }
    }
  }
}
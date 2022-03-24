import Components from './components/index.js'

const app = Vue.createApp({
  data: () => ({
    progressBar: {
      show: false
    },

    error: {
      show: false,
      status: 404,
      message: 'Not found'
    },

    router: {
      state: { },
      current: '/'
    },

    search: {
      term: ''
    },

    playlist: {
      create: false,
      list: USER.PLAYLISTS
    },

    lyrics: {
      direct: true,
      ok: false
    },
    
    user: USER.DATA
  }),

  computed: {
    /**
     * Retorna a URL para a foto do usuário
     * @returns {String}
     */
    profilePicture() {
      return Media.pictureURL(this.user.picture)
    },

    /**
     * Devemos mostrar a barra de progresso?
     * @returns {Boolean}
     */
    showProgressBar() {
      return this.progressBar.show
    },

    /**
     * Devemos mostrar um erro?
     * @returns {Boolean}
     */
    showError() {
      return this.error.show
    },
    
    /**
     * Qual é a rota atual?
     * @returns {String}
     */
    currentRoute() {
      return this.router.current
    },

    /**
     * A rota atual é a home page?
     * @returns {Boolean}
     */
    isHomePage() {
      return this.currentRoute === '/'
    },

    /**
     * É a rota das informações do usuário?
     * @returns {Boolean}
     */
    isUserPage() {
      return this.currentRoute === '/user'
    },

    /**
     * A rota atual é a dashboard?
     * @returns {Boolean}
     */
    isDashboardPage() {
      return this.user.isArtist && this.currentRoute === '/dashboard'
    },

    /**
     * A rota atual é a página de busca?
     * @returns {Boolean}
     */
    isSearchPage() {
      return this.currentRoute.startsWith('/search')
    },

    /**
     * A rota atual é a fila de reprodução?
     * @returns {Boolean}
     */
    isQueuePage() {
      return this.currentRoute === '/queue'
    },

    /**
     * A rota atual é a página do artista?
     * @returns {Boolean}
     */
    isArtistPage() {
      return this.currentRoute.startsWith('/artist')
    },

    /**
     * A rota atual é a página do album?
     * @returns {Boolean}
     */
    isAlbumPage() {
      return this.currentRoute.startsWith('/album')
    },

    /**
     * A rota atual é a página da playlist?
     * @returns {Boolean}
     */
    isPlaylistPage() {
      return this.currentRoute.startsWith('/playlist')
    },

    /**
     * A rota atual é a página das playlists favoritas?
     * @returns {Boolean}
     */
    isFavoritePage() {
      return this.currentRoute === '/favorites'
    },

    /**
     * A rota atual é a página das letras?
     * @returns {Boolean}
     */
    isLyricsPage() {
      return this.currentRoute === '/lyrics'
    },

    /**
     * Retorna a página atual
     * @returns {String}
     */
    currentPage() {
      if (this.isHomePage) return 'home-page'
      else if (this.isUserPage) return 'user-page'
      else if (this.isDashboardPage) return 'dashboard-page'
      else if (this.isSearchPage) return 'search-by'
      else if (this.isArtistPage) return 'artist'
      else if (this.isAlbumPage) return 'album'
      else if (this.isQueuePage) return 'queue'
      else if (this.isPlaylistPage) return 'playlist'
      else if (this.isFavoritePage) return 'favorite-songs'
      else if (this.isLyricsPage) return 'lyrics'
      return 'not-found'
    },

    /**
     * Retorna as propriedades para o componente
     * @returns {Object}
     */
    currentPageProps() {
      return this.isLyricsPage ? this.lyrics : this.router.state
    }
  },

  created() {
    this.onLoadGetRoute()

    /**
     * Mostra ou esconde a barra de progresso
     */
    globalEvents.addEventListener('app:toggle-progress-bar', (value) => {
      this.progressBar.show = value === undefined ? !this.progressBar.show : value
    })

    /**
     * Mostra um erro na tela por um periodo de tempo
     */
    globalEvents.addEventListener('app:display-error', (status, message) => {
      this.error = { status, message, show: true }
      setTimeout(() => this.error.show = false, DISPLAY_ERROR_TIME)
    })

    window.history.onpopstate = window.history.onpushstate = this.onRouteChange.bind(this)
  },

  methods: {
    /**
     * Muda a rota
     * @param {String} path 
     * @param {String} title 
     */
    goTo(path, title) {
      window.history.pushState({}, changePageTitle(`Spozer · ${title}`), path)
    },

    /**
     * Vai para a playlist
     * @param {{ id: Number, name: String }} param0 
     */
    goToPlaylist({ id, name }) {
      window.history.pushState({ id }, changePageTitle(`Spozer · ${name}`), `/playlist/${id}`)
    },
    
    /**
     * 
     * @param {Object} state Estado da rota
     * @param {String} title Titulo da rota
     * @param {String} path  Caminho da rota
     */
    onRouteChange(state, title, path) {
      this.router.state = state
      this.router.current = path
    },

    /**
     * Quando a página carregar checamos em qual tela esta e 
     * trocamos
     */
    onLoadGetRoute() {
      const pathname = window.location.pathname.trim()
      if (pathname === '/' || pathname.length <= 0)
        return

      const state = {}
      const result = pathname.split('/')
      switch (result[1]) {
        case 'album':
        case 'artist':
        case 'playlist':
          state.id = result[2]
          break

        case 'search':
          state.term = this.search.term = decodeURIComponent(result[2])
          break;

        case 'user':
        case 'queue':
        case 'lyrics':
        case 'dashboard':
          break;

        default:
          result[1] = '/'
      }

      this.onRouteChange(state, '', `/${result[1]}`)
    },

    /**
     * Obtém a letra da música
     * @param {String}   artist 
     * @param {String}   song
     * @param {Function} callback 
     */
    async getLyrics(artist, song, callback) {
      const normalizeSong = song.split('-')[0].trim().split('(')[0].trim().toLocaleLowerCase()
      const normalizeArtist = artist.replace('&', 'e').toLocaleLowerCase()
      
      const songKey = btoa(`${normalizeSong}${normalizeArtist}`)
      const fromDatabase = await Database.getLastLyric()
      const lyrics = fromDatabase[songKey] || await api.getLyric({ artist: normalizeArtist, song: normalizeSong })
      await Database.setLastLyric({ [songKey]: lyrics })
      this.lyrics = lyrics
      callback(this.lyrics.ok)
    }
  },

  watch: {
    /**
     * Quando o usuário digitar alguma coisa mudamos para a tela de busca
     */
    ['search.term'](term) {
      if (term.length > 0) {
        window.history.pushState({ term }, 'Spozer — Buscar', `/search/${term}`)
      } else {
        window.history.pushState({ term }, 'Spozer', `/`)
      }
    }
  }
})

Components.forEach(({ name, component }) => app.component(name, component))
app.config.isCustomElement = tag => /^range-/.test(tag)
app.mount('.spozer')
const template = `
<song-list title="Músicas" :songs="songs"></song-list>
<artist-list :artists="artists"></artist-list>
<album-list :albums="albums"></album-list>
`

export default {
  name: 'search-by',
  component: {
    template,

    props: {
      term: {
        type: String
      }
    },

    data: () => ({
      songs: [ ],
      artists: [ ],
      albums: [ ],
      debounce: null,
    }),

    created(){
      this.search()
    },

    methods: {
      /**
       * 
       */
      async search() {
        const { artists = [], albums = [], songs = [] } = await api.searchBy({ term: this.term.trim() })
        this.songs = songs
        this.albums = albums
        this.artists = artists
      }
    },

    watch: {
      term() {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(this.search, 400)
      }
    }
  }
}
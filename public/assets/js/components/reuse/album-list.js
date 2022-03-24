const template = `
<div class="result-section" v-if="albums.length">
  <template v-if="title.length">
    <div class="title">
      <h2>{{ title }}</h2>
    </div>
  </template>

  <div class="result-list">
    <div class="item" v-for="album in albums" @click="goToAlbum(album.id, album.name)">
      <div class="item-picture">
        <img :src="getArtwork(album)">
      </div>

      <p class="main">
        {{ album.name }}
      </p>
      
      <p class="secondary">por
        <template v-for="artist in album.artists">
          <span class="album-artist" @click.stop="goToArtist(artist.id, artist.artistic_name)">
            {{ artist.artistic_name }}
          </span>
        </template>
      </p>
    </div>
  </div>
</div>
`

export default {
  name: 'album-list',
  component: {
    template,

    props: {
      albums: {
        type: Array,
        default: []
      },

      title: {
        type: String,
        default: 'Álbuns'
      }
    },

    methods: {
      /**
       * 
       * @param {{ artwork: String }} param0 
       * @returns {String}
       */
      getArtwork({ artwork }) {
        return Media.artworkURL(artwork)
      },

      goToAlbum(id, album_name) {
        goToAlbumPage(id, album_name)
      },

      goToArtist(id, artistic_name) {
        goToArtistPage(id, artistic_name)
      }
    }
  }
}
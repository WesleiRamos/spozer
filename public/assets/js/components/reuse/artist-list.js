const template = `
<div class="result-section" v-if="artists.length">
  <template v-if="title.length">
    <div class="title">
      <h2>{{ title }}</h2>
    </div>
  </template>

  <div class="result-list artist">
    <div class="item" v-for="artist in artists" @click="goToArtist(artist.id, artist.artistic_name)">
      <div class="item-picture">
        <img :src="getPicture(artist)">
      </div>

      <p class="main">{{ artist.artistic_name }}</p>
    </div>
  </div>
</div>
`

export default {
  name: 'artist-list',
  component: {
    template,

    props: {
      artists: {
        type: Array,
        default: []
      },

      title: {
        type: String,
        default: 'Artistas'
      }
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

      goToArtist(id, artistic_name) {
        goToArtistPage(id, artistic_name)
      }
    }
  }
}
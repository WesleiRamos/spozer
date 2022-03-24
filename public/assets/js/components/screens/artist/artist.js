const template = `
<template v-if="!isLoading && canDisplay">
  <div class="artist-information">
    <div class="cover">
      <div class="artist-cover" :style="getCover"></div>
      <div class="artist-cover-blur" :style="coverBlurColor"></div>
    </div>
    
    <div class="artist">
      <div class="artist-picture">
        <img :src="artistPicture">
      </div>

      <div class="information">
        <div class="information-verified" v-if="isVerified">
          <i class="material-icons">verified</i>
          <span>Artista verificado</span>
        </div>

        <p class="artistic-name">{{ artistName }}</p>
      </div>
    </div>
  </div>

  <div class="artist-production">
    <song-list title="Top músicas" :songs="songs" :showOnly="5"></song-list>
    <album-list :albums="albums.own"></album-list>
    <album-list title="Aparece em" :albums="albums.appearsOn"></album-list>
  </div>
</template>

<div class="under-construction" v-else-if="!isLoading && !canDisplay">
  <h2>OH NÃO 😭</h2>
  <p>Parece que este artista ainda não possui nenhuma produção.</p>
</div>
`

export default {
  name: 'artist',
  component: {
    template,

    props: {
      id: {
        type: [ String, Number ],
        default: 0
      }
    },

    data: () => ({
      isLoading: true,
      
      parallax: {
        content: null,
        toolbar: null,
        scale: 1.5,
        alpha: 0
      },
      
      artist: null,
      songs: [ ],
      albums: null
    }),

    created() {
      this.loadArtist()
    },

    /**
     * Quando o componente for adicionado a pagina remove a cor da barra superior
     * e cria os eventos necessários para a imagem de cover
     */
    mounted() {
      this.parallax.toolbar = document.querySelector('.toolbar')
      this.parallax.content = document.querySelector('.content')
      this.parallax.content.addEventListener('scroll', this.onScroll)
      this.setToolbarColor()
    },

    /**
     * Antes do componente ser destruido, voltamos a cor original da barra superior
     * e removemos o evento de scroll para a imagem de cover
     */
    beforeUnmount() {
      this.setToolbarColor('rgb(35, 35, 35)')
      this.parallax.content.removeEventListener('scroll', this.onScroll)
    },

    computed: {
      canDisplay() {
        return this.artist != null && (this.songs.length != 0 || ( this.albums.own.length || this.albums.appearsOn.length ))
      },

      /**
       * Retorna a foto do artista como imagem de cover, aplica
       * um efeito de escala para aumentar e diminuir conforme o
       * scroll da página
       * @returns {{ background: String, transform: String }}
       */
      getCover() {
        return {
          background: `url(${this.artistPicture})`,
          transform: `scale(${this.parallax.scale})`
        }
      },

      /**
       * Retorna o estilo para ser aplicado ao fundo da imagem de cover
       * do artista
       * @returns {{ backgroundColor: String }}
       */
      coverBlurColor() {
        return {
          backgroundColor: `rgba(35, 35, 35, ${this.parallax.alpha})`
        }
      },

      /**
       * Retorna a url da foto do artista
       * @returns {String}
       */
      artistPicture() {
        return !this.artist.picture ? '' : Media.pictureURL(this.artist.picture)
      },

      /**
       * É um artista verificado?
       * @returns {Boolean}
       */
      isVerified() {
        return this.artist.verified_artist
      },

      /**
       * Qual é o nome do artista
       * @returns {String}
       */
      artistName() {
        return this.artist.artistic_name
      }
    },

    methods: {
      /**
       * Aplica a cor de fundo do toolbar
       * @param {String} color 
       */
      setToolbarColor(color = 'transparent') {
        this.parallax.toolbar.style.backgroundColor = color
      },

      /**
       * Quando o scroll da página for usado, essa função será chamada para
       * calcular os valores que serão passados a imagem de cover e toolbar,
       * e sim, os valores dos calculos foram tirados do além (chutes até ficar bom)
       * @param {EventTarget} event 
       */
      onScroll(event) {
        const alpha = event.target.scrollTop * -0.7
        this.parallax.alpha = Math.abs(Math.min(0.1 + (alpha / 130), 1))
        this.parallax.scale = Math.max(1.5 - Math.abs(alpha / 800), 1)

        const toolbarAlpha = Math.abs(Math.min(alpha / 300, 1))
        this.setToolbarColor(`rgba(35, 35, 35, ${toolbarAlpha})`)
      },

      /**
       * Carrega as informações do artista
       */
      async loadArtist() {
        const { artist = null, songs = [], albums = null } = await api.getArtist({ id: this.id })
        this.artist = artist
        this.songs = songs
        this.albums = albums
        this.isLoading = false
      }
    },

    watch: {
      /**
       * Quando o id mudar atualizamos o artista
       */
      id() {
        this.loadArtist()
      }
    }
  }
}
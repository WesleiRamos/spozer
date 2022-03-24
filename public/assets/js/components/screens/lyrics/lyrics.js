const template = `
<template v-if="ok">
  <div class="song-lyric">
    <div class="lyric">
      {{ lyric }}
    </div> 
    <div class="lyric-by">Letra disponibilizada por vagalume.com.br</div>
  </div>
</template>

<template v-else>
  <div class="under-construction">
    <h2>Ixi... 😬</h2>
    <p>Não temos a letra para essa música.</p>
  </div>
</template>
`

export default {
  name: 'lyrics',
  component: {
    template,

    props: {
      direct: {
        type: Boolean,
        default: false
      },

      ok: {
        type: Boolean,
        default: false
      },

      lyric: {
        type: String,
        default: ''
      }
    },

    /**
     * Se o acesso foi direto, retornamos ao inicio
     */
    created() {
      if (this.direct) {
        window.history.pushState({}, '', '/')
      }
    },

    /**
     * Inserido na pagina, rola pra cima
     */
    mounted() {
      document.querySelector('.content').scrollTop = 0
    },

    watch: {
      /**
       * Letra mudou? Vá para o topo novamente
       */
      lyric() {
        document.querySelector('.content').scrollTop = 0
      }
    }
  }
}
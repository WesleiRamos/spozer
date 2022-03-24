const template = `
<h2 class="title">Dashboard</h2>

<div class="horizontal-menu">
  <div :class="getClass(0)" @click="changeOption(0)">
    <i class="material-icons">music_note</i> Minhas musicas
  </div>

  <div :class="getClass(1)" @click="changeOption(1)">
    <i class="material-icons">album</i> Meus albuns
  </div>

  <div :class="getClass(2)" @click="changeOption(2)">
    <i class="material-icons">playlist_add</i> Adicionar musicas
  </div>
</div>

<template v-if="isMySongs">
  <my-songs></my-songs>
</template>

<template v-else-if="isMyAlbuns">
  <my-albuns></my-albuns>
</template>

<template v-else-if="isAddSong">
  <add-songs></add-songs>
</template>
`

export default {
  name: 'dashboard-page',
  component: {
    template,

    data: () => ({
      option: 0,
    }),

    computed: {
      isMySongs() {
        return this.option === 0
      },

      isMyAlbuns() {
        return this.option === 1
      },

      isAddSong() {
        return this.option === 2
      }
    },

    methods: {
      /**
       * Retorna as classes para os itens do menu
       * @param {Number} n Numero da opção
       * @returns {[ String, { active: Boolean }]}
       */
      getClass(n) {
        return [ 'menu-item', { 'active': this.option === n } ]
      },

      /**
       * Altera o que deve ser exibido conforme a opção passada
       * @param {Number} n 
       */
      changeOption(n) {
        this.option = n
      }
    }
  }
}
const template = `
<h2 class="title">Fila de reprodução</h2>

<template v-if="songs.length">
  <song-list title="" :songs="songs"></song-list>
</template>

<template v-else>
  <p>Parece que aqui está meio vazio...</p>
</template>
`

export default {
  name: 'queue',
  component: {
    template,

    data: () => ({ songs: [ ] }),

    /**
     * Quando a tela da fila for inserida na página, carregamos
     * a fila atual
     */
    async created() {
      this.songs = await Database.getQueue()
    }
  }
}
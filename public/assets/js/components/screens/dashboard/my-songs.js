const template = `
<template v-if="!isLoading">
  <div class="my-songs">
    <div class="table-head">
      <span>#</span>
      <span>Título</span>
      <span>Artista</span>
      <span>Álbum</span>
      <span>Dur.</span>
      <span></span>
    </div>

    <div class="song" v-for="(song, i) in songs">
      <span>{{ i + 1 }}</span>
      <span>{{ song.name }}</span>
      <div>
        <span class="album-artist" v-for="artist in song.artists">
          {{ artist.artistic_name }}
        </span>
      </div>
      <span>{{ song.album }}</span>
      <span>{{ formatTime(song.length) }}</span>
      <div>
        <i @click="enableDisable(i, song)" class="material-icons" title="Habilitar/Desabilitar" :style="getEnableDisableColor(song.enabled)">
          {{ getEnabledDisabledIcon(song.enabled) }}
        </i>
      </div>
    </div>
  </div>
</template>`

export default {
  name: 'my-songs',
  component: {
    template,

    data: () => ({
      isLoading: false,
      songs: []
    }),

    async created() {
      this.isLoading = true
      this.songs = await dashboard.getSongs()
      this.isLoading = false
    },

    methods: {
      getEnabledDisabledIcon(enabled) {
        return enabled ? 'check_circle_outline' : 'remove_circle_outline'
      },

      getEnableDisableColor(enabled) {
        return { color: enabled ? '#4c9b4c' : '#eb5555' }
      },

      formatTime(seconds) {
        return formatTime(seconds)
      },

      async enableDisable(i, { id, enabled }) {
        const res = await dashboard.enableSong({ id, enable: !enabled })
        this.songs[i].enabled = res.enabled
      }
    }
  }
}
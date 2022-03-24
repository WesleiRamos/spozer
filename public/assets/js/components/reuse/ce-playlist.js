const template = `
<div class="modal">
  <div class="form modal-content" style="max-width: 500px">
    <h2 class="title">Criar uma playlist</h2>

    <form @submit.prevent="onFormSubmit">
      <div>
        <label class="placeholder">
          <input type="text" min="2" v-model="name" :disabled="isCreating" required>
          <span>Insira o nome da playlist</span>
        </label>
      </div>

      <div>
        <button class="btn">Criar</button>
        <button class="btn cancel" type="button" @click="onCancelCreate">Cancelar</button>
      </div>
    </form> 
  </div>
</div>
`

export default {
  name: 'create-edit-playlist',
  component: {
    template,

    props: {
      close: {
        type: Function,
        default: () => {}
      }
    },

    setup() {
      return {
        name: '',
        isCreating: false
      }
    },

    methods: {
      /**
       * Quando o formulário for submetido
       */
      async onFormSubmit() {
        this.name = this.name.trimLeft()
        if (this.name.trim().length <= 2)
          return

        const playlist = await api.createPlaylist({ name: this.name })
        void(USER.PLAYLISTS.push(playlist)) || this.close()
      },

      /**
       * Desistiu da ideia :(
       */
      onCancelCreate() {
        this.close()
      }
    }
  }
}
const template  = `
<div>
  <div class="user">
    <div class="user-picture" @click="openModal">
      <div class="select-picture-modal">
        <span class="material-icons">mode_edit</span>
        <span>Escolher foto</span>
      </div>

      <img :src="profilePicture">
    </div>

    <div class="information">
      <p class="user-name">
        {{ name }}
      </p>
      
      <span class="user-member-since">
        Membro desde {{ memberSince }}
      </span>
    </div>
  </div>

  <div class="modal" v-if="modalShow">
    <div class="form modal-content" style="width: 650px">
      <h2 class="title">
        Alterar foto de perfil
      </h2>

      <form @submit.prevent="onFormSubmit">
        <div class="image-preview">
          <div class="image picture">
            <img :src="previewPicture">
          </div>

          <div class="preview-select">
            <p class="note">A imagem enviada será redimensionada, imagens de altura e largura iguais, serão melhor visualizadas.</p>

            <label>
              <span>Escolher foto</span>
              <input type="file" ref="picture" @change="pictureSelected" accept=".png, .jpg, .jpeg" :disabled="isLoading">
              <div class="select-file">Selecionar arquivo</div>
            </label>
            
            <p class="note">Ao continuar, você autoriza o Spozer a acessar a imagem enviada. Certifique-se de que você tem o direito de fazer o upload dessa imagem.</p>
          </div>
        </div>

        <div>
          <button class="btn" :disabled="isLoading">Salvar</button>
          <button class="btn cancel" type="button" @click="closeModal" :disabled="isLoading">Fechar</button>
        </div>
      </form>
    </div>
  </div>
</div>`

export default {
  name: 'user-page',
  component: {
    template,
    
    data: () => ({
      user: USER.DATA,
      isLoading: false,
      newPicture: null,
      modalShow: false
    }),

    computed: {
      /**
       * Retorna o nome
       * @returns {String}
       */
      name() {
        if (this.user.isArtist)
          return this.user.artisticName

        return `${this.user.firstname} ${this.user.lastname}`
      },

      /**
       * Retorna a foto de perfil
       * @returns {String}
       */
      profilePicture() {
        return Media.pictureURL(this.user.picture)
      },

      /**
       * Retorna a data de registro do usuário
       * @returns {String}
       */
      memberSince() {
        return new Date(this.user.memberSince).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' })
      },

      /**
       * Retorna a foto de preview do usuário
       * @returns {String}
       */
      previewPicture() {
        return this.newPicture ? window.URL.createObjectURL(this.newPicture) : this.profilePicture
      }
    },

    methods: {
      /**
       * Altera a foto de preview
       */
      pictureSelected() {
        this.newPicture = this.$refs.picture.files[0]
      },

      /**
       */
      openModal() {
        this.modalShow = true
      },

      /**
       */
      closeModal() {
        if (this.newPicture != null) {
          window.URL.revokeObjectURL(this.previewPicture)
          this.previewPicture = null
        }

        this.modalShow = false
      },

      /**
       * Envia a nova foto de perfil
       */
      async onFormSubmit() {
        this.isLoading = true
        const { picture = '' } = await api.changeUserPicture({ picture: this.newPicture })
        USER.DATA.picture = picture
        this.isLoading = false
      }
    }
  }
}
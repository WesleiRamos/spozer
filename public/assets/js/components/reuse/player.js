const AudioPlayer = new Audio()

const template = `
<div class="player">
  <div class="playing-now">
    <template v-if="current.song">
      <img :src="currentSongArtwork" @click="goToAlbum">
      <div class="song-info">
        <h2>{{ current.song.name }}</h2>
        <p style="color: gray">
          {{ currentSongArtists }}
        </p>
      </div>
    </template>
    <div class="not-playing" v-else></div>
  </div>


  <div class="player-controls">
    <div class="controls">
      <i class="material-icons">repeat</i>
      <i class="material-icons" @click="nextSong(-1)">chevron_left</i>

      <div class="play-pause">
        <img :src="getPlayPauseIcon" @click="playPause">
      </div>
      
      <i class="material-icons" @click="nextSong(1)">chevron_right</i>
      <i class="material-icons">shuffle</i>
    </div>

    <div class="player-progress">
      <span class="time">{{ formatTime(current.time) }}</span>
      <range-slider :max="currentSongLength" value="0" @change="playerBarChange" @input="previewTime" @mousedown="seekingTime" ref="seekbar"></range-slider>
      <span class="time">{{ formatTime(currentSongLength) }}</span>
    </div>
  </div>

  <div class="player-volume">
    <div class="icons">
      <span class="material-icons" @click="goToQueue" title="Fila de reprodução">queue_music</span>
      <span class="material-icons" :style="lyricIconStyle" @click="goToLyrics">mic</span>
    </div>

    <div>
      <span class="material-icons">volume_up</span>
      <range-slider min="0" max="100" value="100" @input="volumeChange" @change="volumeChange" class="volume" ref="volumebar"></range-slider>
    </div>
  </div>
</div>`

let CURRENT_QUEUE = null
let IS_LOADING_LAST_PLAYED_QUEUE = false

export default { 
  name: 'song-player',
  component: {
    template,

    props: {
      findLyrics: {
        type: Function,
        default: () => {}
      }
    },

    data: () => {
      return {
        paused: true,
        duration: 0,
        seeking: false,
        current: {
          time: 0,
          index: 0,
          song: null
        },
        enableLyricIcon: false
      }
    },

    /**
     * Quando o player for criado então chamamos createPlayer e mediaSession para o player e registramos
     * um evento para podermos tocar as musicas por outros componentes 
     */
    async created() {
      this.createMediaSession()
      this.createPlayer()
      globalEvents.addEventListener('player:change-song', this.changeSong.bind(this))
    },

    /**
     * Função que será chamada quando o player for inserido na página, definimos os valores da barra de progresso
     * caso tenha sido tocada alguma musica anteriormente, e define o volume salvo
     */
    async mounted() {
      await this.loadLastQueuePlayed()
      await this.loadLastVolumeDefined()
      this.$refs.seekbar.value = this.current.time
      this.$refs.volumebar.value = AudioPlayer.volume * 100
    },

    computed: {
      /**
       * Que icone deve ser mostrado
       * @returns {String}
       */
      getPlayPauseIcon() {
        return `${APP_URL}/public/assets/images/icons/${this.paused ? 'Play' : 'Pause'}.png`
      },

      /**
       * Retorna os artistas da música
       * @returns {String}
       */
      currentSongArtists() {
        return this.current.song.artists.map(({ artistic_name }) => artistic_name).join(', ')
      },

      /**
       * Retorna a artwork da música
       * @returns {String}
       */
      currentSongArtwork() {
        if (this.current.song === null)
          return ''

        return Media.artworkURL(this.current.song.album.artwork)
      },

      /**
       * Retorna o tamanho da música
       * @returns {String}
       */
      currentSongLength() {
        if (this.current.song === null)
          return 0

        return this.current.song.length
      },

      /**
       * Retorna a cor do botão de letra
       * @returns {{ color: String, marginLeft: String }}
       */
      lyricIconStyle() {
        const style = { marginLeft: '10px' }
        if (!this.enableLyricIcon)
          style.color = 'rgb(100, 100, 100)'

        return style
      }
    },

    methods: {
      /**
       * Pegamos o volume salvo anteriormente setamos na barra de volume e no player
       */
      async loadLastVolumeDefined() {
        AudioPlayer.volume = await Database.getVolume()
      },

      /**
       * Se ja ouvimos musicas antes, puxamos as informações da ultima playlist tocada
       */
      async loadLastQueuePlayed() {
        const lastQueue = await Database.getQueue()
        IS_LOADING_LAST_PLAYED_QUEUE = lastQueue.length != 0

        if (!IS_LOADING_LAST_PLAYED_QUEUE)
          return;

        this.current.time = await Database.getProgress()
        this.current.index = await Database.getCurrentIndex()

        this.changeSong(this.current.index, lastQueue, false)
      },

      /**
       * Altera o titulo da página pra mostrar que musica está tocando ou se está pausado
       */
      changeTitle() {
        if (this.paused)
          return void(document.title = 'Spozer')
    
        document.title = `${this.current.song.name} · ${this.currentSongArtists}`
      },
    
      /**
       * Determina se está ou não pulando a musica
       */
      seekingTime() {
        this.seeking = true
      },
    
      /**
       * Quando o usuário soltar a barra de progresso altera o tempo da musica
       * @param {Event} param0 
       */
      playerBarChange({ target }) {
        const value = parseInt(target.value)
        AudioPlayer.currentTime = value
    
        setTimeout(() => {
          this.seeking = false
          AudioPlayer.play()
        }, 100)
      },
    
    
      /**
       * Altera o volume do player
       * @param {Event} param0 
       */
      async volumeChange({ target }) {
        AudioPlayer.volume = parseInt(target.value) / 100
        await Database.setVolume(AudioPlayer.volume)
      },
    
    
      /**
       * Previsualiza o tempo da barra quando for pular para um tempo em especifico
       * @param {Event} param0 
       */
      previewTime({ target }) {
        this.current.time = parseInt(target.value)
      },

    
      /**
       * Formata os segundos em mm:ss
       * @param {Number} seconds 
       */
      formatTime(seconds) {
        return formatTime(seconds)
      },
    

      /**
       * Altera para a musica selecionada
       * @param {Number} index 
       * @param {Number} playlist 
       * @param {Boolean} [play=true]
       */
      async changeSong(index, playlist, updateLastQueue = true) {
        CURRENT_QUEUE = JSON.parse(JSON.stringify(playlist))

        if (updateLastQueue) {
          IS_LOADING_LAST_PLAYED_QUEUE = false
          await Database.setQueue(CURRENT_QUEUE)
          await Database.setCurrentIndex(index)
        }

        this.current.index = index
        this.current.song = playlist[index]

        const { file_id } = await api.getSongFile({ id: this.current.song.id })
        AudioPlayer.src = Media.audioURL(file_id)
        AudioPlayer.load()

        if (navigator.mediaSession) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: this.current.song.name,
            artist: this.currentSongArtists,
            album: this.current.song.album.name,
            artwork: [ '96x96', '128x128', '192x192', '256x256', '384x384', '512x512' ].map(sizes => ({
              sizes,
              type: 'image/png',
              src: this.currentSongArtwork
            }))
          })
        }
      },
    
      /**
       * Avança ou retorna uma musica
       * @param {Number} direction 
       */
      nextSong(direction = 1) {
        let playlist = CURRENT_QUEUE
        
        // 
        if (this.current.song) {
          this.updateProgress(this.current.song.length)
        }
    
        if (direction === 1) {
          if (this.current.index === playlist.length - 1)
            return
        } else {
          /**
           * 1 click volta pro inicio
           * 2 click e o tempo de musica for menor que meio segundo volta pra anterior
           */
          if (AudioPlayer.currentTime > 0.5) {
            AudioPlayer.currentTime = 0
            return
          }
    
          if (this.current.index === 0)
            return
        }
    
        const next = this.current.index + direction
        this.changeSong(next, CURRENT_QUEUE)
      },
    
      /**
       * Altera o estado do player
       */
      playPause() {
        if (AudioPlayer.readyState) {
          this.paused ? AudioPlayer.play() : AudioPlayer.pause()
        }
      },
    
      /**
       * Atualiza a barra de progresso e o tempo decorrido
       * @param {Number} time 
       */
      async updateProgress(time) {
        if (IS_LOADING_LAST_PLAYED_QUEUE || this.seeking)
          return;

        this.current.time = time <= this.currentSongLength ? time : this.currentSongLength
        this.$refs.seekbar.value = this.current.time
        await Database.setProgress(this.current.time)
      },
    
      /**
       * Cria os eventos no player para manipular os controles
       */
      createPlayer() {
        /**
         * Define paused com o status que foi definido na primeira chamada da função
         * usando void apenas pra deixar numa linha só pois como void retorna undefined
         * então sempre executa o que vem depois do OU
         * @param {Boolean} status 
         * @returns {() => void}
         */
        const changePlayerPauseStatus = status => () => void(this.paused = status) || this.changeTitle()

        // Acabou? então próxima
        AudioPlayer.addEventListener('ended', () => void(this.paused = true) || this.nextSong())

        // Quando as informações da musica forem carregadas, então
        // definimos o tamanho máximo da musica e caso estivermos
        // carregando a ultima lista de musica tocada, definimos o
        // tempo atual com a quantia que foi tocada da ultima musica
        AudioPlayer.addEventListener('loadeddata', () => {
          if (IS_LOADING_LAST_PLAYED_QUEUE)
            AudioPlayer.currentTime = this.current.time
        })

        // Toda vez que tocar algo definimos que não estamos carregando a ultima playlist tocada
        AudioPlayer.addEventListener('playing', () => {
          IS_LOADING_LAST_PLAYED_QUEUE = false
        })

        // Apenas as musicas clicadas devem tocar automaticamente, isso evita que quando a pagina carregue
        // automaticamente toque a ultima musica (não toca automaticamente se não houve nenhuma interação com a página)
        AudioPlayer.addEventListener('canplay', () => {
          if (!IS_LOADING_LAST_PLAYED_QUEUE) AudioPlayer.play()
        })

        AudioPlayer.addEventListener('play', changePlayerPauseStatus(false))
        AudioPlayer.addEventListener('pause', changePlayerPauseStatus(true))
        AudioPlayer.addEventListener('timeupdate', () => this.updateProgress(AudioPlayer.currentTime))   
      },

      /**
       * Cria controles nativos do sistema operacional, ex: windows https://imgur.com/GMXK5Gd
       */
      createMediaSession() {
        const mediaSession = navigator.mediaSession
        mediaSession.setActionHandler('play', () => this.playPause())
        mediaSession.setActionHandler('pause', () => this.playPause())
        mediaSession.setActionHandler('nexttrack', () => this.nextSong())
        mediaSession.setActionHandler('previoustrack', () => this.nextSong(-1))
      },

      /**
       * Tenta buscar uma letra pelo artista da musica
       * @param {Number} index 
       * @returns {Promise}
       */
      tryFindLyricByArtist(artist, song) {
        return new Promise((resolve) => this.findLyrics(artist, song, result => resolve(this.enableLyricIcon = result)))
      },

      /**
       * Muda a página para o album da musica
       * @returns {void}
       */
      goToAlbum() {
        if (this.current.song === null)
          return

        const { album } = this.current.song
        goToAlbumPage(album.id, album.name)
      },

      /**
       * Mostra a fila de reprodução
       */
      goToQueue() {
        goToQueuePage()
      },

      /**
       * Mostra a letra da musica
       */
      goToLyrics() {
        if (this.enableLyricIcon) goToLyricsPage()
      }
    },

    watch: {
      /**
       * A musica trocou? procura letra
       * @param {Object} song 
       * @param {Object} last
       */
      async ['current.song'](song, last) {
        if (last != null && song.id === last.id)
          return // Se é a mesma então nem gaste banda
        
        this.enableLyricIcon = false

        /**
         * Tenta achar por cada artista da lista, se achou para
         */
        for (let i = 0; i < song.artists.length; i++) {
          if (await this.tryFindLyricByArtist(song.artists[i].artistic_name, song.name)) break;
        }
      }
    }
  }
}
/**
 * URL raiz da página
 */
const APP_URL = `${window.location.protocol}//${window.location.hostname}`

/**
 * Funções que retornam urls para os recursos solicitados
 */
const Media = (() => {
  /**
   * Retorna a url para a media solicitada
   * @param {String} type 
   * @returns {(gid: String) => String}
   */
  const createMediaUrl = type => gid =>
    `${APP_URL}/media/${type}/${gid}`

  const picture = createMediaUrl('picture')

  return Object.freeze({    
    artworkURL: createMediaUrl('artwork'),
    audioURL: createMediaUrl('audio'),
    pictureURL: picId => {
      return picId.trim().length === 0 ? `${APP_URL}/public/assets/images/default-picture.png` : picture(picId)
    }
  })
})();

/**
 * Banco de dados que salvara a fila atual, musica, tempo em que
 * a ultima musica parou e o volume que estava
 */
const Database = (() => {
  localforage.config({ name: 'Spozer' })

  /**
   * Obtém um valor da database
   */
  const get = (key, defaultValue) => async () =>
    (value = await localforage.getItem(key)) === null
      ? defaultValue
      : value

  /**
   * Salva um valor na database
   */
  const set = key => async value =>
    void(await localforage.setItem(key, value)) || value

  return Object.freeze({
    getQueue: get('queue', []),
    getCurrentIndex: get('current', 0),
    getProgress: get('progress', 0),
    getVolume: get('volume', 1),
    getLastLyric: get('lyric', {}),
    setQueue: set('queue'),
    setCurrentIndex: set('current'),
    setProgress: set('progress'),
    setVolume: set('volume'),
    setLastLyric: set('lyric'),

    /**
     * Atualiza o status de favorita da playlist no banco
     * @param {String|Number} id 
     * @param {Boolean} fav 
     */
    updateFavQueue: async (id, fav) => {
      const queue = await Database.getQueue()
      queue.forEach(song => song.favorite = song.id === id ? fav : song.favorite)
      await Database.setQueue(queue)
    },
  })
})();

/**
 * Altera e retorna o titulo da página
 * @param {String} title 
 * @returns {String}
 */
const changePageTitle = title =>
  void(document.title = title) || title

/**
 * Muda a pagina para a fila de reprodução
 * @returns {void}
 */
const goToQueuePage = () =>
  window.history.pushState({ }, null, `/queue`) 

/**
 * Muda a pagina para a letra da musica
 * @returns {void}
 */
const goToLyricsPage = () =>
  window.history.pushState({ }, null, `/lyrics`) 

/**
 * Muda a pagina para artistas
 * @param {String} id 
 * @param {String} artistic_name 
 * @returns {void}
 */
const goToArtistPage = (id, artistic_name) =>
  window.history.pushState({ id }, changePageTitle(`Spozer · ${artistic_name}`), `/artist/${id}`)

/**
 * Muda a página para album
 * @param {String} id 
 * @param {String} album_name 
 * @returns {void}
 */
const goToAlbumPage = (id, album_name) => 
  window.history.pushState({ id }, changePageTitle(`Spozer · ${album_name}`), `/album/${id}`)

/**
 * A forma mais simples que eu encontrei pra fazer a comunicação entre componentes, já
 * que o layout antigo era todo unificado
 */
const globalEvents = (() => {
  /**
   * @type {Map<String, Function>}
   */
  const events = new Map()

  /**
   * Registra o evento
   * @param {String} event 
   * @param {Function} callback 
   * @returns {Map<String, Function>}
   */
  const addEventListener = (event, callback) =>
    events.set(event, callback)

  /**
   * Remove um evento
   * @param {String} event 
   * @returns {Boolean}
   */
  const removeEventListener = (event) =>
    events.delete(event)

  /**
   * Emite um evento
   * @param {String} event 
   * @param  {...any} args 
   * @returns 
   */
  const dispatchEvent = (event, ...args) =>
    (events.get(event) || (() => {}))(...args)

  return Object.freeze({ addEventListener, removeEventListener, dispatchEvent })
})();

/**
 * Padrozina e facilita a execução de requisições para a api
 */
const request = (() => {
  /**
   * Retorna a url da api com o rota informada
   * @returns {String}
   */
  const getApiURL = (path = '') => 
    `${APP_URL}/api${path}`

  /**
   * Converte o json em formdata para que o php consiga ler as informações nativamente
   * @param {Object} json 
   * @returns {FormData}
   */
  const jsonToFormData = json => {
    const form = new FormData()
    for (let [ key, value ] of Object.entries(json)) {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          form.set(`${key}[${i}]`, value[i])
        }
      } else {
        form.set(key, value)
      }
    }

    return form
  }

  /**
   * Converte um json em parametros de url, ex: { foo: 10, bar: 20 } vira foo=10&bar=20
   * @param {Object} json 
   * @returns {String}
   */
  const jsonToParams = json =>
    new URLSearchParams(json).toString()

  return async (path, { method = 'get', body = {}, params = {} }) => {
    const init = { method }
    const url  = [ getApiURL(path) ]

    switch (method) {
      case 'get':
        url.push(jsonToParams(params))
        break;
      
      // php não tem suporte nativo a put e delete?
      case 'delete':
      case 'put':
        init.body = JSON.stringify(body)
        break;

      default:
        init.body = jsonToFormData(body)
    }

    globalEvents.dispatchEvent('app:toggle-progress-bar', true)
    const res = await fetch(url.join('?'), init)
    globalEvents.dispatchEvent('app:toggle-progress-bar', false)
    const json = await res.json()
    if (!(res.status >= 200 && res.status <= 226))
      globalEvents.dispatchEvent('app:display-error', res.status, json.error)

    return json.result
  }
})();

(() => {
  /**
   * O problema aqui é que precisamos manipular o histórico para criar rotas localmente,
   * porém o histórico não emite nenhum evento pra saber se a rota foi mudada, apenas é possível
   * saber se o usuário voltou uma rota no histórico, assim criamos uma referencia a função antiga
   * de alterar o estado e atribuimos uma função nova para a manipulação de um evento, assim alertando
   * a mudança de rota
   */
  const pushState = window.history.pushState;
  window.history.pushState = (...args) => {
    if (typeof window.history.onpushstate === 'function') {
      window.history.onpushstate(...args)
    }

    return pushState.call(window.history, ...args)
  }

  /**
   * Unifica a chamada pra se parecer ao pushState com estado, titulo e caminho,
   * assim consigo usar a mesma função de mudança de rota tanto com push quanto pra pop
   * @param {PopStateEvent} event 
   */
  window.onpopstate = event => {
    if (typeof window.history.onpopstate === 'function') {
      window.history.onpopstate(event.state, document.title, window.location.pathname)
    }
  }
})();

/**
 * Transforma segundos para o formato mm:ss
 * @param {Number} seconds 
 * @returns {String}
 */
const formatTime = seconds =>
  new Date(seconds * 1000).toISOString().substr(14, 5)

/**
 * Tempo em que erros serão exibidos na tela (padrão 5s)
 * @type {Number}
 */
const DISPLAY_ERROR_TIME = 1000 * 5
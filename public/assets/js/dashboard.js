const dashboard = (() => {
  /**
   * Retorna uma função que chama a api com base nas informações passadas
   * @param {String} path 
   * @param {String} method 
   * @returns {(data: Object) => Object}
   */
  const execRoute = (path, method = 'get') => async (data = {}) => {
    return await request(`/dashboard${path}`, {
      method, [method === 'get' ? 'params' : 'body']: data
    })
  }

  return Object.freeze({
    /**
     *
     */
    getArtists: execRoute('/artist/get'),

    getSongs: execRoute('/songs/get'),
    createSong: execRoute('/songs/create', 'post'),
    enableSong: execRoute('/songs/enable', 'put'),

    getAlbuns: execRoute('/album/get'),
    createAlbum: execRoute('/album/create', 'post'),
    editAlbum: execRoute('/album/edit', 'post')
  })
})();
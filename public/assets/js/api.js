const api = (() => {
  /**
   * Retorna uma função que chama a api com base nas informações passadas
   * @param {String} path 
   * @param {String} method 
   * @returns {(data: Object) => Object}
   */
  const execRoute = (path, method = 'get') => async (data = {}) => {
    return await request(path, {
      method, [method === 'get' ? 'params' : 'body']: data
    })
  }

  return Object.freeze({
    getLyric: execRoute('/lyrics/get'),
    searchBy: execRoute('/search/get'),
    getArtist: execRoute('/artists/get'),
    getAlbum: execRoute('/album/get'),
    getSongFile: execRoute('/audio/get'),
    getFavoriteSongs: execRoute('/favorite/get'),
    favoriteSong: execRoute('/favorite/post', 'post'),
    createPlaylist: execRoute('/playlist/create', 'post'),
    insertPlaylistSong: execRoute('/playlist/add', 'put'),
    removePlaylistSong: execRoute('/playlist/remove', 'post'),
    getPlaylistSongs: execRoute('/playlist/get'),
    changeUserPicture: execRoute('/user/changepic', 'post')
  })
})();
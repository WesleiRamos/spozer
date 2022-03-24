import Home from './home/index.js'
import User from './user/index.js'
import Queue from './queue/index.js'
import Album from './album/index.js'
import Search from './search/index.js'
import Artist from './artist/index.js'
import Lyrics from './lyrics/index.js'
import Playlist from './playlist/index.js'
import Dashboard from './dashboard/index.js'
import FavoriteSongs from './favorite/index.js'

export default [
  ...Home,
  ...User,
  ...Queue,
  ...Search,
  ...Artist,
  ...Album,
  ...Lyrics,
  ...Playlist,
  ...Dashboard,
  ...FavoriteSongs
]
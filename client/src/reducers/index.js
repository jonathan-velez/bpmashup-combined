//root reducer, combines all reducers, which update state
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { firebaseReducer } from 'react-redux-firebase';

import trackListing from './trackListing';
import genreListing from './genreListing';
import isLoading from './isLoading';
import openModal from './openModal';
import playlistList from './playlistList';
import mediaPlayer from './mediaPlayer';
import autoSuggest from './autoSuggest';
import lovedTracks from './lovedTracks';
import lovedArtists from './lovedArtists';
import lovedArtistsDetails from './lovedArtistsDetails';
import lovedLabels from './lovedLabels';
import lovedLabelsDetails from './lovedLabelsDetails';
import searchResults from './searchResults';
import releaseListing from './releaseListing';
import artistDetail from './artistDetail';
import labelDetail from './labelDetail';
import userDetail from './userDetail';
import noDownloadList from './noDownloadList';
import chartListing from './chartListing';
import actionMessage from './actionMessage';
import downloadQueue from './downloadQueue';

const rootReducer = combineReducers({
  trackListing,
  genreListing,
  isLoading,
  openModal,
  playlistList,
  mediaPlayer,
  autoSuggest,
  lovedTracks,
  lovedArtists,
  lovedLabels,
  lovedLabelsDetails,
  firebaseState: firebaseReducer,
  routing: routerReducer,
  searchResults,
  releaseListing,
  artistDetail,
  labelDetail,
  userDetail,
  lovedArtistsDetails,
  noDownloadList,
  chartListing,
  actionMessage,
  downloadQueue,
});

export default rootReducer;

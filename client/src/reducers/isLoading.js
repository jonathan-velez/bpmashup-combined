import {
  START_ASYNC,
  FETCH_TRACKS,
  SEARCH_TRACKS,
  GET_YOUTUBE_LINK,
  STOP_ASYNC,
  SEARCH_EVERYTHING,
  GET_RELEASE_DATA,
  GET_ARTIST_DETAIL,
  GET_ARTIST_EVENTS_BY_NAME,
  GET_LABEL_DETAIL,
  GENERAL_ERROR,
  GET_TRACKS,
  LOAD_LOVED_LABELS_DETAILS,
  GET_CHART_DATA,
  FETCH_CHARTS_BY_PROFILE_ID,
  FETCH_CHARTS_BY_GENRE_ID,
  FETCH_RELEASES,
  FETCH_CHARTS,
} from '../constants/actionTypes';

const isLoading = (state = false, action) => {
  switch (action.type) {
    case START_ASYNC:
      return true;
    case SEARCH_TRACKS:
    case FETCH_TRACKS:
    case GET_YOUTUBE_LINK:
    case STOP_ASYNC:
    case SEARCH_EVERYTHING:
    case GET_RELEASE_DATA:
    case GET_ARTIST_DETAIL:
    case GET_ARTIST_EVENTS_BY_NAME:
    case GET_LABEL_DETAIL:
    case GET_TRACKS:
    case GENERAL_ERROR:
    case LOAD_LOVED_LABELS_DETAILS:
    case GET_CHART_DATA:
    case FETCH_CHARTS:
    case FETCH_CHARTS_BY_PROFILE_ID:
    case FETCH_CHARTS_BY_GENRE_ID:
    case FETCH_RELEASES:
      if (action.error) console.log(GENERAL_ERROR, action.error);
      return false;
    default:
      return state;
  }
};

export default isLoading;

import {
  START_ASYNC,
  FETCH_TRACKS,
  SEARCH_TRACKS,
  GET_YOUTUBE_LINK,
  STOP_ASYNC,
  SEARCH_EVERYTHING,
  GET_RELEASE_DATA,
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
      return false;
    default:
      return state;
  }
};

export default isLoading;
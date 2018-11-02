import firebase from 'firebase';
import { DOWNLOAD_TRACK } from '../constants/actionTypes';

const setFirebase = (state, trackId) => {
  const { uid } = state.firebaseState.auth;

  if (!uid || uid === 0) return;

  const db = firebase.database();
  const downloadsRef = db.ref(`users/${uid}/downloads/${trackId}`);

  downloadsRef.transaction(currentValue => {
    return (currentValue || 0) + 1;
  })
}

export const downloadTrack = payload => {
  return (dispatch, getState) => {
    dispatch({
      type: DOWNLOAD_TRACK,
      payload
    })

    setFirebase(getState(), payload);
  }
}

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import { toggleMute } from '../actions/ActionCreators';

const MutePlayer = ({ mediaPlayer, toggleMute }) => {
  const { muted } = mediaPlayer;
  return (
    <Icon
      link
      fitted
      name={muted ? 'mute' : 'unmute'}
      onClick={toggleMute}
      size='large'
      className='muteIcon'
    />
  );
}

const mapStateToProps = state => {
  return {
    mediaPlayer: state.mediaPlayer
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ toggleMute }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MutePlayer);

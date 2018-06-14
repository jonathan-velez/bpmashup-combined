import React from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Header, Message, Form, Input } from 'semantic-ui-react';
import Scroll from 'react-scroll';

import * as actionCreators from '../actions/ActionCreators';
import TrackListingTable from './TrackListingTable';
import PlaylistHeader from './PlaylistHeader';
import * as thunks from '../thunks';

class PlaylistController extends React.Component {
  playlistId = this.props.match.params.playlistId;
  playlist = this.props.playlistList && this.props.playlistList[this.playlistId];

  state = {
    playlistNameEditMode: false,
    deletePlaylist: false,
  }

  componentDidMount() {
    Scroll.animateScroll.scrollToTop({ duration: 100 });

    if (this.playlist) {
      this.props.loadTracks(this.playlist.tracks);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.playlistId = this.props.match.params.playlistId;
    this.playlist = this.props.playlistList && this.props.playlistList[this.playlistId];

    if (!prevState.playlistNameEditMode && this.state.playlistNameEditMode) {
      this.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { playlistId: newPlaylistId } = nextProps.match.params;
    const { playlistId: currentPlaylistId } = this.props.match.params;

    const newPlaylistObj = (nextProps.playlistList && nextProps.playlistList[newPlaylistId]);
    const currentPlaylistObj = (this.props.playlistList && this.props.playlistList[currentPlaylistId]);

    if (!newPlaylistObj || !currentPlaylistObj) {
      return;
    }

    const { tracks: newPlaylistTracks = {} } = newPlaylistObj;
    const { tracks: currentPlaylistTracks = {} } = currentPlaylistObj;

    // handle confirm modal update to delete
    if (nextProps.confirmModal.confirm && this.state.deletePlaylist) {
      this.actuallyDeletePlaylists();
      this.props.resetConfirm();
    }

    // something new to load
    if (currentPlaylistId && currentPlaylistId !== newPlaylistId && newPlaylistObj) {
      this.props.loadTracks(newPlaylistTracks);
      return;
    }

    // if num of tracks changed, loadTracks again
    if (newPlaylistId && newPlaylistObj && currentPlaylistObj) {
      const currentTrackListLength = Object.keys(currentPlaylistTracks).length;
      const newTrackListLength = Object.keys(newPlaylistTracks).length;

      if (currentTrackListLength && currentTrackListLength !== newTrackListLength) {
        this.props.loadTracks(newPlaylistTracks);
      }
    }
  }

  callRemoveFromPlaylist = (trackId) => {
    this.props.removeFromPlaylist({ playlistId: this.props.match.params.playlistId, trackId: trackId });
  }

  togglePlaylistNameEditMode = () => {
    this.setState({ playlistNameEditMode: !this.state.playlistNameEditMode });
  }

  handlePlaylistNameChange = evt => {
    this.props.editPlaylistName({
      playlistId: this.playlistId,
      newName: evt.target.value
    });
  }

  deletePlaylist = () => {
    this.setState({ deletePlaylist: true })
    this.props.openConfirm({
      content: 'Are you sure you want to delete this playlist?',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });
  }

  actuallyDeletePlaylists = () => {
    const { deletePlaylist } = this.state;

    if (deletePlaylist) {
      this.props.deletePlaylist(this.playlistId);
      this.setState({ deletePlaylist: false });
    }
  }

  handleRef = (c) => {
    this.inputRef = c;
  }

  focus = () => {
    this.inputRef.focus();
    ReactDOM.findDOMNode(this.inputRef).querySelector('input').select();
  }

  handleFormSubmit = evt => {
    this.togglePlaylistNameEditMode();
  }

  render() {
    const { playlistId } = this.props.match.params;
    const playlist = this.props.playlistList && this.props.playlistList[playlistId];

    if (!playlist) {
      return (
        <Message error>
          <Header size='huge'>Invalid Playlist</Header>
          <p>Oops! Looks like this playlist does not exist.</p>
        </Message>
      )
    }

    let { trackListing, isLoading } = this.props;
    const { tracks } = trackListing;

    return (
      <React.Fragment>
        {this.state.playlistNameEditMode ?
          <Form onSubmit={this.handleFormSubmit} className='playlistEditInput'>
            <Input
              value={playlist.name}
              onChange={this.handlePlaylistNameChange}
              size='massive' //TODO: Style this to be the same as the header
              onBlur={this.togglePlaylistNameEditMode}
              ref={this.handleRef}
              fluid
              transparent
            />
          </Form> :
          <PlaylistHeader playlistName={playlist.name} editHeader={this.togglePlaylistNameEditMode} deletePlaylist={this.deletePlaylist} />
        }
        <TrackListingTable
          trackListing={tracks}
          isLoading={isLoading}
          removeFromPlaylist={this.callRemoveFromPlaylist}
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => {
  return {
    playlistList: state.playlistList,
    trackListing: state.trackListing,
    confirmModal: state.confirmModal,
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(Object.assign({}, actionCreators, thunks), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistController);

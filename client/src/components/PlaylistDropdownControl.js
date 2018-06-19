import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Dropdown } from 'semantic-ui-react';

import { getAllPlaylistsTrackCount, getPlaylistCount } from '../utils/playlistUtils';
import { slugify } from '../utils/helpers';

const PlaylistDropdownControl = ({ playlistList }) => {
  this.playlistItems = '';

  this.firstListItem = <Dropdown.Item disabled text={`${getPlaylistCount(playlistList)} playlists, ${getAllPlaylistsTrackCount(playlistList)} tracks`} />

  if (playlistList && Object.keys(playlistList).length > 0) {
    this.playlistItems = _.map(playlistList, playlist => {
      const { name, id } = playlist;
      const url = `/playlist/${slugify(name)}/${id}`;

      return (
        <Dropdown.Item
          text={`${name} (${playlist.listOfTracks ? playlist.listOfTracks.length : 0})`}
          as={Link}
          to={url}
          key={id}
          value={id}
        />
      )
    });
  }

  return (
    <Dropdown
      item
      scrolling
      text='Playlists'
    >
      <Dropdown.Menu>
        {this.firstListItem}
        {this.playlistItems}
      </Dropdown.Menu>
    </Dropdown>
  )
}

const mapStateToProps = state => {
  return {
    playlistList: state.playlistList
  }
}

export default connect(mapStateToProps, null)(PlaylistDropdownControl);

import React from 'react';
import _ from 'lodash';
import { Table, Icon, Transition } from 'semantic-ui-react';

import TrackAlbum from './TrackAlbum';
import DownloadTrack from './DownloadTrack';

const TrackListingTableBody = ({ trackListing, removeFromPlaylist }) => {
  let trackListingBody = '';

  if (Object.keys(trackListing).length > 0) {
    // sort by the order it was added to the playlist
    const orderedTracks = _.orderBy(trackListing, 'timeStamp', 'asc');

    trackListingBody = _.map(orderedTracks, (track, idx) => {
      return (
        <Table.Row key={track.id}>
          <Table.Cell>
            {idx + 1}
          </Table.Cell>
          <Table.Cell>
            <TrackAlbum
              imageUrl={track.images.large.secureUrl}
              imageSize='tiny'
              iconSize='big'
              track={track}
            />
          </Table.Cell>
          <Table.Cell>{track.title}</Table.Cell>
          <Table.Cell>{track.artists[0].name}</Table.Cell>
          <Table.Cell>{track.label.name}</Table.Cell>
          <Table.Cell>{track.genres[0].name}</Table.Cell>
          <Table.Cell>{track.releaseDate}</Table.Cell>
          <Table.Cell><DownloadTrack track={track} mini blue /></Table.Cell>
          <Table.Cell>
            <Icon link name='delete' color='red' onClick={() => removeFromPlaylist(track.id.toString())} />
          </Table.Cell>
        </Table.Row>
      )
    });
  } else {
    trackListingBody = (
      <Table.Row>
        <Table.Cell singleLine textAlign='center'>No tracks added!</Table.Cell>
      </Table.Row>
    )
  }

  return (
    <Transition.Group 
      as={Table.Body}
      animation='slide right'
      duration={200}
    >
      {trackListingBody}
    </Transition.Group>
  );
};

export default TrackListingTableBody;

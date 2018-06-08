import React from 'react';
import { Link } from 'react-router-dom';

import { Card, Label } from 'semantic-ui-react';
import AddToPlaylist from './AddToPlaylist';
import TrackAlbum from './TrackAlbum';
import { constructLinks, trackGenreColors } from '../utils/trackUtils';
import DownloadTrack from './DownloadTrack';
import { musicalKeyFilter } from '../utils/helpers';

/*
  TODO: Use <Card color='xxx' /> for favorited labels/artists OR to identify genre?
*/

class Track extends React.Component {
  state = {
    active: false,
  }

  handleShow = () => this.setState({ active: true });
  handleHide = () => this.setState({ active: false });

  render() {
    const { track } = this.props;

    return (
      <Card
        className='flex-card'
        id={`track-${track.id}`}
        color={trackGenreColors[track.genres[0].name.toLowerCase()]}
      >
        <TrackAlbum
          imageUrl={track.images.large.secureUrl}
          imageSize={null}
          track={track}
        />
        <Card.Content>
          {track.position && <Label attached='top left' color='red'>{track.position}</Label>}
          <Card.Header>{track.title}</Card.Header>
          <Card.Content>{constructLinks(track.artists, 'artist')}</Card.Content>
          <Card.Content><Link to={`/most-popular/label/${track.label.slug}/${track.label.id}`}>[{track.label.name}]</Link></Card.Content>
          <Card.Content>{constructLinks(track.genres, 'genre')}</Card.Content>
          <Card.Meta><b>BPM:</b> {track.bpm} <b>Key:</b> {musicalKeyFilter(track.key && track.key.shortName)}</Card.Meta>
          <Card.Meta><b>Released:</b> {track.releaseDate}</Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <div className='ui two buttons'>
            <DownloadTrack track={track} />
            <AddToPlaylist track={track} />
          </div>
        </Card.Content>
      </Card >
    )
  }
}

export default Track;

import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Responsive } from 'semantic-ui-react';

import GenreControl from './GenreControl';
import PlaylistDropdownControl from './PlaylistDropdownControl';
import SearchTracks from './SearchTracks';
import Auth from './Auth';
import logo from '../static/vinyl-lg.png';

class Navigation extends React.PureComponent {
  render() {
    return (
      <Menu fixed='top' borderless>
        <Menu.Item header>
          <Link to='/'>
            <img src={logo} height='32' width='32' alt='BPMashup' />
          </Link>
        </Menu.Item>
        <GenreControl />
        <PlaylistDropdownControl />
        <Menu.Item as={Link} to='/charts/all'>
          CHARTS
        </Menu.Item>
        <Menu.Item as={Link} to='/tracks'>
          TRACKS
        </Menu.Item>
        <Responsive minWidth={850} as={Menu.Item}>
          <SearchTracks />
        </Responsive>
        <Menu.Item position='right'>
          <Auth />
        </Menu.Item>
      </Menu>
    );
  }
}

export default Navigation;

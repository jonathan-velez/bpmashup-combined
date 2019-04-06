import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import { Image, Icon, Menu } from 'semantic-ui-react';

import store from '../store';
import { clearPlaylists, openLoginModalWindow } from '../actions/ActionCreators';

class Auth extends React.Component {
  logIn = () => {
    store.dispatch(openLoginModalWindow());
  }

  logOut = () => {
    this.props.firebase.logout().then(() => {
      store.dispatch(clearPlaylists());
    });
  }
  
  render() {
    const { auth } = this.props;
    const { photoURL } = auth;

    const logOutButton = (
      <React.Fragment>
        <Menu.Item
          position='right'
          link
          onClick={() => this.logOut()}
        >
          <Image
            src={photoURL}
            size='mini'
            circular
          />&nbsp;
        <span>Log out</span>
          <Icon
            name='sign out'
            size='large'
          />
        </Menu.Item >
      </React.Fragment>
    );

    const logInButton = (
      <Menu.Item
        position='right'
        link
        onClick={() => this.logIn()}
      >
        <span>Log in</span>
        <Icon
          name='sign in'
          size='large'
        />
      </Menu.Item >
    );

    return (
      <React.Fragment>{auth.isEmpty ? logInButton : logOutButton}</React.Fragment>
    );
  }
}

export default compose(
  firebaseConnect(),
  connect(({ firebaseState: { auth } }) => ({ auth }))
)(Auth);

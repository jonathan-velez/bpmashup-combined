import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import Scroll from 'react-scroll';

import { getTracksByIds } from '../thunks/tracksThunk';
import { startAsync } from '../actions/ActionCreators';
import TracklistingHeader from './TracklistingHeader';
import TrackListingGroup from './TrackListingGroup';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '../constants/defaults';

class MyDownloadsAndLovedTracks extends Component {
  componentDidMount() {
    const { match, downloadedTracks, lovedTracks } = this.props;
    const { pageType } = match.params;

    if (pageType === 'downloads') {
      if (downloadedTracks.length > 0) {
        this.fetchTracks(downloadedTracks);
      }
    } else {
      if (lovedTracks.length > 0) {
        this.fetchTracks(lovedTracks);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { location, isLoading, match } = this.props;
    const { downloadedTracks, lovedTracks, trackListing, location: nextLocation, match: nextMatch } = nextProps;
    const { tracks } = trackListing;

    // what type of page to render
    const { pageType: thisPageType } = match.params;
    const { pageType: nextPageType } = nextMatch.params;

    // parse query params
    const { search: nextSearch } = nextLocation;
    const { search: thisSearch } = location;
    const thisParams = {};
    thisSearch.replace('?', '').split('&').forEach(param => {
      const splitParam = param.split('=');
      thisParams[splitParam[0]] = splitParam[1];
    });
    const nextParams = {};
    nextSearch.replace('?', '').split('&').forEach(param => {
      const splitParam = param.split('=');
      nextParams[splitParam[0]] = splitParam[1];
    });

    // which page are we loading?
    const thisPage = +thisParams.page || DEFAULT_PAGE;
    const newPage = +nextParams.page || DEFAULT_PAGE;

    // how many tracks per page?
    const thisPerPage = +thisParams.perPage || DEFAULT_PER_PAGE;
    const newPerPage = +nextParams.perPage || DEFAULT_PER_PAGE;

    if (nextPageType === 'downloads') {
      if (nextPageType !== thisPageType || (downloadedTracks.length > 0 && tracks && Object.keys(tracks).length === 0 && !isLoading)) {
        this.fetchTracks(downloadedTracks, newPage, newPerPage);
      } else {
        if ((thisPage !== newPage || thisPerPage !== newPerPage) && !isLoading) {
          this.fetchTracks(downloadedTracks, newPage, newPerPage);
        }
      }
    } else {
      if (nextPageType !== thisPageType || (lovedTracks.length > 0 && tracks && Object.keys(tracks).length === 0)) {
        this.fetchTracks(lovedTracks, newPage, newPerPage);
      } else {
        if (thisPage !== newPage || thisPerPage !== newPerPage) {
          this.fetchTracks(lovedTracks, newPage, newPerPage);
        }
      }
    }
  }

  fetchTracks(ids = [], page, perPage) {
    if (ids.length > 0) {
      const { getTracksByIds, startAsync } = this.props;
      startAsync();
      Scroll.animateScroll.scrollToTop({ duration: 1000 });
      getTracksByIds(ids.join(','), page, perPage);
    }
  }

  render() {
    let { match, trackListing, isLoading } = this.props;
    const { pageType } = match.params;

    return (
      <React.Fragment>
        <Dimmer active={isLoading} page>
          <Loader content='Loading' />
        </Dimmer>
        <TracklistingHeader headerTitle={pageType === 'downloads' ? 'My Downloads' : 'My Loved Tracks'} />
        <TrackListingGroup trackListing={trackListing} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    trackListing: state.trackListing,
    downloadedTracks: state.downloadedTracks,
    lovedTracks: state.lovedTracks,
    isLoading: state.isLoading,
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(Object.assign({}, { getTracksByIds, startAsync }), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MyDownloadsAndLovedTracks));
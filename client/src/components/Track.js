import React, { useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  Grid,
  Image,
  Header,
  Statistic,
  Card,
  Divider,
  Transition,
  Pagination,
  Segment,
} from 'semantic-ui-react';
import { animateScroll } from 'react-scroll';

import TrackListingCards from './TrackListingCards';
import TrackAlbum from './TrackAlbum';
import TrackCardActionRow from './TrackCardActionRow';
import NothingHereMessage from './NothingHereMessage';
import { constructLinks, constructTrackLink } from '../utils/trackUtils';
import { getCamelotKey } from '../utils/helpers';
import { callAPIorCache } from '../seessionStorageCache';
import { API_GET_TRACKS, API_GET_CHART } from '../constants/apiPaths';
import {
  DEFAULT_BP_ITEM_IMAGE_URL,
  DEFAULT_PAGE_TITLE,
} from '../constants/defaults';
import { hasZippyPermission } from '../selectors';

const Track = ({ location = {}, match = {}, canZip }) => {
  const chartsPerPage = 8;
  const { params = {} } = match;
  const { trackId: trackIdParam } = params;
  const { state: stateProp = {} } = location;
  const { track: trackProp = {} } = stateProp;

  const initialState = {
    trackData: {},
    chartData: {
      metadata: {},
      results: [],
    },
    similarTracksData: [],
    visible: false,
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'load_track_data': {
        return {
          ...state,
          visible: true,
          trackData: action.payload,
        };
      }
      case 'load_chart_data': {
        return {
          ...state,
          chartData: action.payload,
        };
      }
      case 'load_similar_tracks_data': {
        return {
          ...state,
          similarTracksData: action.payload,
        };
      }
      default: {
        return state;
      }
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const loadChartsByTrackId = async (id, page = 1, perPage = chartsPerPage) => {
    const chartsResult = await callAPIorCache(
      `${API_GET_CHART}?track_id=${id}&page=${page}&per_page=${perPage}`,
    );

    const { data = {}, status } = chartsResult;

    if (status !== 200) {
      return;
    }

    dispatch({
      type: 'load_chart_data',
      payload: data,
    });
  };

  const loadData = async (trackProp) => {
    // Track object (trackProp) is passed as prop in location.state if the user lands here through <Link />
    // If the user lands here via other means, we need to fetch the Track data
    // Once we have Track data, we need to fetch the list of Charts the track is on
    // Lastly, we fetch similar tracks
    const trackData = await loadTrackDataFromPropsOrFetch(trackProp);
    const { id } = trackData;

    if (id) {
      await Promise.all([loadChartsByTrackId(id), loadSimilarTracksData(id)]);
    }
    animateScroll.scrollToTop({ duration: 1500 });
  };

  const loadTrackDataFromPropsOrFetch = async (trackProp) => {
    let trackData;

    if (!trackProp.id) {
      trackData = await fetchTrackData(trackIdParam);
    } else {
      trackData = trackProp;
    }

    dispatch({
      type: 'load_track_data',
      payload: trackData,
    });

    return trackData;
  };

  const loadSimilarTracksData = async (trackId) => {
    if (!trackId) return;

    const similarTracksData = await fetchSimilarTracksData(trackId);
    dispatch({
      type: 'load_similar_tracks_data',
      payload: similarTracksData,
    });
  };

  const fetchTrackData = async (trackId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const trackData = await callAPIorCache(
          `${API_GET_TRACKS}?id=${trackId}`,
        );
        const { data = {}, status } = trackData;

        if (status !== 200) {
          return reject();
        }

        const { results = [] } = data;
        if (results && results.length > 0) {
          return resolve(data.results[0]);
        }

        return resolve({});
      } catch (error) {
        return reject(error);
      }
    });
  };

  const fetchSimilarTracksData = async (trackId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const tracksData = await callAPIorCache(
          `/api/tracks/similar?id=${trackId}&per_page=10&page=1`,
        );
        const { data, status } = tracksData;
        if (status !== 200) {
          return reject();
        }

        if (data.results && data.results.length > 0) {
          return resolve(data.results);
        }
        return resolve([]);
      } catch (error) {
        reject(error);
      }
    });
  };

  useEffect(() => {
    loadData(trackProp);
  }, [trackIdParam]);

  const handleChartPageChange = (e, data) => {
    const { activePage = 1 } = data;
    const { trackData = {} } = state;
    const { id } = trackData;

    if (!id) return;

    loadChartsByTrackId(id, activePage);
  };

  const {
    visible = false,
    chartData = [],
    trackData = {},
    similarTracksData = [],
  } = state;
  const {
    id,
    genre = {},
    artists = [],
    image: waveFormImage,
    publish_date,
    key,
    bpm,
    release = {},
    name,
    mix_name,
    length,
  } = trackData;
  const { image = {}, label = {} } = release;
  const { id: labelId, name: labelName, slug: labelSlug } = label;

  const {
    results: chartDataResults,
    count: chartCount,
    per_page: chartPerPage,
  } = chartData;
  const chartTotalPages = Math.ceil(chartCount / chartPerPage);

  if (!id) {
    return <NothingHereMessage />;
  }

  let pageTitle = '';
  if (name) {
    pageTitle = name;

    if (mix_name) {
      pageTitle += ' (' + mix_name + ')';
    }

    if (artists.length > 0) {
      let artistsString = artists.reduce(
        (acc, val, idx) => (acc += (idx > 0 ? ', ' : '') + val.name),
        '',
      );
      pageTitle += ' by ' + artistsString;
    }

    pageTitle += ' :: ';
  }

  pageTitle += DEFAULT_PAGE_TITLE;

  // TODO: refactor segments into individual components, add loaders for each
  return (
    <Transition visible={visible} animation='fade' duration={500}>
      <>
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <Segment placeholder padded='very'>
          <Grid stackable>
            <Grid.Row stretched>
              <Grid.Column width={4}>
                {id && (
                  <TrackAlbum
                    imageUrl={(image && image.uri) || DEFAULT_BP_ITEM_IMAGE_URL}
                    track={trackData}
                    imageSize='medium'
                  />
                )}
              </Grid.Column>
              <Grid.Column width={12}>
                <Header as='h1' className='track-title'>
                  {constructTrackLink(trackData, 'black-font')}
                  <Header.Subheader>
                    {constructLinks(artists, 'artist')}
                  </Header.Subheader>
                  <Header.Subheader>
                    {release.id && (
                      <Link to={`/release/${release.slug}/${release.id}`}>
                        {release.name}
                      </Link>
                    )}
                  </Header.Subheader>
                </Header>
                <Image src={waveFormImage && waveFormImage.uri} />
              </Grid.Column>
              <Grid.Column width={4}>
                <TrackCardActionRow
                  canZip={canZip}
                  numOfButtons={'three'}
                  track={trackData}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns='equal' divided>
              <Grid.Column>
                <Statistic size='mini'>
                  <Statistic.Label>LENGTH</Statistic.Label>
                  <Statistic.Value>{length}</Statistic.Value>
                </Statistic>
              </Grid.Column>
              <Grid.Column>
                <Statistic size='mini'>
                  <Statistic.Label>RELEASED</Statistic.Label>
                  <Statistic.Value>{publish_date}</Statistic.Value>
                </Statistic>
              </Grid.Column>
              <Grid.Column>
                <Statistic size='mini'>
                  <Statistic.Label>BPM</Statistic.Label>
                  <Statistic.Value>{bpm}</Statistic.Value>
                </Statistic>
              </Grid.Column>
              <Grid.Column>
                <Statistic size='mini'>
                  <Statistic.Label>KEY</Statistic.Label>
                  <Statistic.Value>{getCamelotKey(key)}</Statistic.Value>
                </Statistic>
              </Grid.Column>
              <Grid.Column>
                <Statistic size='mini'>
                  <Statistic.Label>GENRE</Statistic.Label>
                  <Statistic.Value>
                    {constructLinks([genre], 'genre')}
                  </Statistic.Value>
                </Statistic>
              </Grid.Column>
              <Grid.Column>
                <Statistic size='mini'>
                  <Statistic.Label>LABEL</Statistic.Label>
                  <Statistic.Value>
                    <Link to={`/label/${labelSlug}/${labelId}`}>
                      {labelName}
                    </Link>
                  </Statistic.Value>
                </Statistic>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
        <Divider />
        <Grid>
          {chartTotalPages > 0 && (
            <>
              <Grid.Row width={16}>
                <Header as='h3' className='track-title'>
                  Appears on these Charts
                </Header>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={16}>
                  <Card.Group
                    stackable
                    itemsPerRow={chartsPerPage}
                    className='trackListingCardGroup'
                  >
                    {chartDataResults &&
                      chartDataResults.length > 0 &&
                      chartDataResults.map(
                        (chart, idx) =>
                          idx < chartsPerPage && (
                            <Card
                              className='flex-card'
                              key={chart.id}
                              as={Link}
                              to={`/chart/${chart.slug}/${chart.id}`}
                            >
                              <Image
                                src={
                                  chart.image && chart.image.uri
                                    ? chart.image.uri
                                    : DEFAULT_BP_ITEM_IMAGE_URL
                                }
                                className='flex-card'
                              />
                              <Card.Content>{chart.name}</Card.Content>
                            </Card>
                          ),
                      )}
                  </Card.Group>
                </Grid.Column>
              </Grid.Row>
              {chartTotalPages > 1 && (
                <Grid.Row>
                  <Grid.Column width={16}>
                    <Pagination
                      defaultActivePage={1}
                      firstItem={null}
                      lastItem={null}
                      pointing
                      secondary
                      totalPages={chartTotalPages}
                      onPageChange={handleChartPageChange}
                    />
                  </Grid.Column>
                </Grid.Row>
              )}
            </>
          )}
          {similarTracksData && similarTracksData.length > 0 && (
            <>
              <Divider />
              <Grid.Row width={16}>
                <Header as='h3' className='track-title'>
                  Similar Tracks
                </Header>
              </Grid.Row>
            </>
          )}
          <Grid.Row>
            <Grid.Column width={16}>
              {similarTracksData && similarTracksData.length > 0 && (
                <TrackListingCards
                  trackListing={similarTracksData}
                  itemsPerRow={4}
                  showPosition={false}
                />
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </>
    </Transition>
  );
};

const mapStateToProps = (state) => {
  return {
    canZip: hasZippyPermission(state),
  };
};

export default connect(
  mapStateToProps,
  null,
)(Track);

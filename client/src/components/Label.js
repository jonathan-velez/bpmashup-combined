import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Grid, Image, Header, Menu, Button } from 'semantic-ui-react';
import Scroll from 'react-scroll';
import { Link } from 'react-router-dom';

import { getLabelDetail } from '../thunks';
import LoveItem from './LoveItem';
import ShowMore from './ShowMore';
import GenreLabel from './GenreLabel';
import ItemCards from './ItemCards';
import TrackListingGroup from './TrackListingGroup';
import { DEFAULT_PAGE_TITLE } from '../constants/defaults';

const Label = ({
  match,
  labelDetail,
  trackListing,
  location,
  getLabelDetail,
}) => {
  const { labelId, labelName } = match.params;
  const { labelData, releasesData } = labelDetail;
  const { images, name, id, biography, genres, slug } = labelData;
  const imageSrc = images && images.large && images.large.secureUrl;
  const { pathname } = location;

  const [activeItem, setActiveItem] = useState('tracks');

  useEffect(() => {
    Scroll.animateScroll.scrollToTop({ duration: 1500 });
    getLabelDetail(labelId, labelName);
  }, [getLabelDetail, labelId, labelName]);

  const handleItemClick = (e, { name }) => {
    setActiveItem(name);
  };

  return (
    <>
      <Helmet>
        <title>
          {name ? `${name} :: ` : ``}
          {DEFAULT_PAGE_TITLE}
        </title>
      </Helmet>
      <Grid stackable>
        {imageSrc && (
          <Grid.Row columns={2}>
            <Grid.Column>
              <Image src={imageSrc} size='medium' />
            </Grid.Column>
            <Grid.Column textAlign='right'>
              <Header size='huge' className='item-header'>
                {name}{' '}
                <LoveItem
                  itemType='label'
                  item={{ id, name, slug }}
                  type='button'
                />
              </Header>
              {biography && <ShowMore content={biography} />}
            </Grid.Column>
          </Grid.Row>
        )}
        {genres && (
          <Grid.Row columns={1}>
            <Grid.Column>
              <Header textAlign='left' dividing>
                GENRES
              </Header>
              {genres &&
                genres.map((genre, idx) => {
                  return (
                    <GenreLabel
                      key={idx}
                      genreName={genre.name}
                      genreSlug={genre.slug}
                      genreId={genre.id}
                    />
                  );
                })}
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
      <Menu secondary pointing>
        <Menu.Item
          link
          name='tracks'
          className='item-header'
          active={activeItem === 'tracks'}
          onClick={handleItemClick}
        >
          Top Tracks
        </Menu.Item>
        <Menu.Item
          link
          name='releases'
          className='item-header'
          active={activeItem === 'releases'}
          onClick={handleItemClick}
        >
          Featured Releases
        </Menu.Item>

        <Menu.Item position='right'>
          <Button as={Link} to={`${pathname}/tracks`}>
            View All Tracks
          </Button>
        </Menu.Item>
      </Menu>
      {activeItem === 'tracks'
        ? trackListing && <TrackListingGroup trackListing={trackListing} />
        : releasesData && (
            <ItemCards
              items={releasesData}
              itemType='release'
              showHeader={false}
            />
          )}
    </>
  );
};

const mapStateToProps = (state) => {
  const { labelDetail, trackListing } = state;
  return {
    labelDetail,
    trackListing,
  };
};

const mapDispatchToProps = {
  getLabelDetail,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Label);

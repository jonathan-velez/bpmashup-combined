import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Checkbox,
  Container,
  Grid,
  Pagination,
  Select,
} from 'semantic-ui-react';

import DownloadQueueTable from './DownloadQueueTable';
import { updateTrackStatus } from '../thunks';
import { fileExistsOnDownloadServer } from '../utils/trackUtils';
import { generateActivityMessage } from '../utils/storeUtils';
import {
  setDownloadQueueSettings,
  getDownloadQueueSettings,
} from '../utils/helpers';

const DownloadQueuePage = ({
  updateTrackStatus,
  queueItems,
  // userPreferences,
}) => {
  // TODO: switch to firebase preferences once we build them out
  // const { downloadQueueDefaultSortBy = {} } = userPreferences;

  // load preferences from sessionStorage
  // TODO: Decide if this is stupid to do. Why not just use redux or firebase?
  const downloadQueueSettings = getDownloadQueueSettings();
  const {
    hideFailed: hideFailedStoredSetting = false,
    limitPerPage: limitPerPageStoredSettng = 10,
    showArchiveItems: showArchiveItemsStoredSetting = false,
    sortBy: sortByStoredSetting = 'newest',
  } = downloadQueueSettings;

  const [activePage, setActivePage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(limitPerPageStoredSettng);
  const [currentItems, setCurrentItems] = useState([]);
  const [currentItemsPaginated, setCurrentItemsPaginated] = useState([]);
  const [showArchiveItems, setShowArchiveItems] = useState(
    showArchiveItemsStoredSetting,
  );
  const [hideFailed, setHideFailed] = useState(hideFailedStoredSetting);
  const [sortBy, setSortBy] = useState(sortByStoredSetting);

  const sortByOptions = [
    {
      key: 'newest',
      text: 'Newest',
      value: 'newest',
    },
    {
      key: 'oldest',
      text: 'Oldest',
      value: 'oldest',
    },
    {
      key: 'status',
      text: 'Status',
      value: 'status',
    },
  ];

  const tracksPerPageOptions = [
    {
      key: '10',
      text: '10',
      value: 10,
    },
    {
      key: '25',
      text: '25',
      value: 25,
    },
    {
      key: '50',
      text: '50',
      value: 50,
    },
  ];

  useEffect(() => {
    let items = queueItems;

    switch (sortBy) {
      case 'status':
        items.sort((a, b) => {
          const statusA = a.status.toUpperCase();
          const statusB = b.status.toUpperCase();

          if (statusA < statusB) {
            return -1;
          }
          if (statusA > statusB) {
            return 1;
          }

          return 0;
        });
        break;
      case 'oldest':
        items.sort((a, b) => a.addedDate - b.addedDate);
        break;
      case 'newest':
      default:
        items.sort((a, b) => b.addedDate - a.addedDate);
    }

    if (!showArchiveItems) {
      items = items.filter(
        (item) => item.status !== 'downloaded' && item.status !== 'purchased',
      );
    }

    if (hideFailed) {
      items = items.filter((item) => item.status !== 'notAvailable');
    }

    setCurrentItems(items);
    setCurrentItemsPaginated(items.slice(0, limitPerPage));
    setActivePage(1);
  }, [queueItems, showArchiveItems, hideFailed, limitPerPage, sortBy]);

  const handleDownloadClick = async (url, fileName, queueId) => {
    // check if file still exists on server. Due to Heroku Dyno's ephemeral file system, file existence is not guaranteed
    // if it doesn't, re-initiate for processing in download queue

    const fileExists = await fileExistsOnDownloadServer(fileName);
    if (fileExists) {
      const downloadWindow = window.open('/downloadLink.html', '_blank');
      downloadWindow.location = url;
      updateTrackStatus(queueId, 'downloaded');
    } else {
      updateTrackStatus(queueId, 'initiated'); // TODO: set update date, since this is a re-do
      generateActivityMessage(
        'File not found on server, re-initiating download',
      );
    }
  };

  const retryDownload = (queueId) => {
    updateTrackStatus(queueId, 'initiated'); // TODO: set update date and retry tally. consider throttling/limiting requests
    generateActivityMessage('Track re-initiated for processing.');
  };

  const markTrackAsPurchased = (queueId) => {
    updateTrackStatus(queueId, 'purchased');
    generateActivityMessage('Track marked as purchased.');
  };

  const handlePageChange = (e, data) => {
    const start = data.activePage * limitPerPage - limitPerPage;
    const end = start + limitPerPage;

    setActivePage(data.activePage);
    setCurrentItemsPaginated(currentItems.slice(start, end));
  };

  const handleArchiveToggle = (e, data) => {
    const { checked } = data;
    setShowArchiveItems(checked);
    setDownloadQueueSettings({ showArchiveItems: checked });
  };

  const handleHideFailed = (e, data) => {
    const { checked } = data;
    setHideFailed(checked);
    setDownloadQueueSettings({ hideFailed: checked });
  };

  const handleSetLimitPerPage = (e, data) => {
    const { value } = data;
    setLimitPerPage(value);
    setDownloadQueueSettings({ limitPerPage: value });
  };

  const handleSetSortBy = (e, data) => {
    const { value } = data;
    setSortBy(value);
    setDownloadQueueSettings({ sortBy: value });
  };

  return (
    <Fragment>
      <Container>
        <Grid columns={4} centered verticalAlign='middle'>
          <Grid.Row>
            <Grid.Column floated='right'>
              <Checkbox
                toggle
                label='Include Downloaded/Purchased'
                onChange={handleArchiveToggle}
                checked={showArchiveItems}
              />
            </Grid.Column>
            <Grid.Column floated='right'>
              <Checkbox
                toggle
                label='Hide Failed'
                onChange={handleHideFailed}
                checked={hideFailed}
              />
            </Grid.Column>
            <Grid.Column floated='right'>
              <label style={{ paddingRight: '10px' }}>Per page</label>
              <Select
                label='Tracks per page'
                selection
                compact
                options={tracksPerPageOptions}
                value={limitPerPage}
                onChange={(e, data) => handleSetLimitPerPage(e, data)}
              />
            </Grid.Column>
            <Grid.Column>
              <label style={{ paddingRight: '10px' }}>Sort by</label>
              <Select
                label='Sort by'
                selection
                options={sortByOptions}
                value={sortBy}
                onChange={(e, data) => handleSetSortBy(e, data)}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
      <DownloadQueueTable
        queue={currentItemsPaginated}
        downloadTrack={handleDownloadClick}
        retryDownload={retryDownload}
        markTrackAsPurchased={markTrackAsPurchased}
      />
      <Grid>
        <Grid.Row columns={2}>
          <Grid.Column floated='left' textAlign='left' verticalAlign='middle'>
            {`${currentItems.length} tracks`}
          </Grid.Column>
          <Grid.Column floated='right' textAlign='right' verticalAlign='middle'>
            <Pagination
              onPageChange={(e, data) => handlePageChange(e, data)}
              totalPages={Math.ceil(currentItems.length / limitPerPage)}
              activePage={activePage}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Fragment>
  );
};

const mapStateToProps = (state) => {
  const { downloadQueue, userDetail } = state;
  const { preferences } = userDetail;

  return {
    queueItems: Object.keys(downloadQueue.queue).map(
      (val) => downloadQueue.queue[val],
    ),
    userPreferences: preferences,
  };
};

const mapDispatchToProps = {
  updateTrackStatus,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DownloadQueuePage);
